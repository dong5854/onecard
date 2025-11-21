import {
  BadRequestException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as ort from 'onnxruntime-node';
import { promises as fs } from 'node:fs';
import path from 'node:path';

import type {
  GameSettings,
  GameState,
} from '@/modules/game/domain/types/gameState';
import {
  buildActionMask,
  applyActionMask,
  mapActionIndexToPayload,
  selectAction,
} from '@/modules/game/inference/action-mask';
import {
  buildObservationSpec,
  encodeObservation,
} from '@/modules/game/inference/observation-encoder';

interface OnnxMetadata {
  observation_dim: number;
  action_dim: number;
  settings: GameSettings;
  opset_version?: number;
}

interface LoadedModel {
  session: ort.InferenceSession;
  metadata: OnnxMetadata;
  spec: ReturnType<typeof buildObservationSpec>;
}

@Injectable()
export class OnnxPolicyService {
  private readonly modelDir =
    process.env.ONNX_MODEL_DIR ?? path.join(process.cwd(), 'assets', 'onnx');
  private readonly cache = new Map<string, LoadedModel>();

  private buildSuffix(settings: GameSettings): string {
    return `p${String(settings.numberOfPlayers)}_joker${settings.includeJokers ? 'on' : 'off'}`;
  }

  private resolvePaths(settings: GameSettings): {
    modelPath: string;
    metadataPath: string;
  } {
    const suffix = this.buildSuffix(settings);
    const modelPath = path.join(this.modelDir, `ppo-onecard_${suffix}.onnx`);
    const metadataPath = `${modelPath}.json`;
    return { modelPath, metadataPath };
  }

  private async readMetadata(metadataPath: string): Promise<OnnxMetadata> {
    try {
      const raw = await fs.readFile(metadataPath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<OnnxMetadata>;
      if (
        !parsed.settings ||
        typeof parsed.observation_dim !== 'number' ||
        typeof parsed.action_dim !== 'number'
      ) {
        throw new Error('Invalid metadata shape');
      }
      return parsed as OnnxMetadata;
    } catch {
      throw new NotFoundException(
        `메타데이터를 읽을 수 없습니다: ${metadataPath}`,
      );
    }
  }

  private assertSettingsCompatible(
    modelSettings: GameSettings,
    requestSettings: GameSettings,
  ): void {
    const keys: (keyof GameSettings)[] = [
      'numberOfPlayers',
      'includeJokers',
      'maxHandSize',
      'initHandSize',
      'mode',
      'difficulty',
    ];
    for (const key of keys) {
      if (modelSettings[key] !== requestSettings[key]) {
        throw new BadRequestException(
          `모델 설정(${key})과 현재 게임 설정이 다릅니다.`,
        );
      }
    }
  }

  private async loadModelIfNeeded(
    settings: GameSettings,
  ): Promise<LoadedModel> {
    const suffix = this.buildSuffix(settings);
    const cached = this.cache.get(suffix);
    if (cached) return cached;

    const { modelPath, metadataPath } = this.resolvePaths(settings);
    const metadata = await this.readMetadata(metadataPath);

    // build spec from model metadata settings
    const spec = buildObservationSpec(metadata.settings);
    if (spec.vectorSize !== metadata.observation_dim) {
      throw new BadRequestException(
        `메타데이터 관측 차원(${String(metadata.observation_dim)})과 스펙(${String(spec.vectorSize)})이 일치하지 않습니다.`,
      );
    }
    if (metadata.action_dim !== spec.maxHandSize + 1) {
      throw new BadRequestException(
        `메타데이터 행동 차원(${String(metadata.action_dim)})과 maxHandSize+1(${String(spec.maxHandSize + 1)})이 일치하지 않습니다.`,
      );
    }

    let session: ort.InferenceSession;
    try {
      session = await ort.InferenceSession.create(modelPath);
    } catch {
      throw new InternalServerErrorException(
        `ONNX 모델을 로드할 수 없습니다: ${modelPath}`,
      );
    }

    const loaded: LoadedModel = { session, metadata, spec };
    this.cache.set(suffix, loaded);
    return loaded;
  }

  public async checkHealth(settings: GameSettings): Promise<{
    suffix: string;
    observationDim: number;
    actionDim: number;
    settings: GameSettings;
  }> {
    const loaded = await this.loadModelIfNeeded(settings);
    return {
      suffix: this.buildSuffix(settings),
      observationDim: loaded.metadata.observation_dim,
      actionDim: loaded.metadata.action_dim,
      settings: loaded.metadata.settings,
    };
  }

  public async predictAction(state: GameState): Promise<{
    actionIndex: number;
    logits: number[];
    payload: ReturnType<typeof mapActionIndexToPayload>;
  }> {
    const modelSettings = state.settings;
    const model = await this.loadModelIfNeeded(modelSettings);

    // ensure settings match
    this.assertSettingsCompatible(model.metadata.settings, state.settings);

    const observation = encodeObservation(state, model.spec);
    if (observation.length !== model.metadata.observation_dim) {
      throw new BadRequestException('관측 차원이 모델과 일치하지 않습니다.');
    }

    const mask = buildActionMask(state, model.spec.maxHandSize);
    if (mask.length !== model.metadata.action_dim) {
      throw new BadRequestException(
        '행동 마스크 길이가 모델과 일치하지 않습니다.',
      );
    }

    const tensor = new ort.Tensor('float32', observation, [
      1,
      observation.length,
    ]);

    let logitsTensor: ort.Tensor | undefined;
    try {
      const outputs = await model.session.run({ observation: tensor });
      logitsTensor = outputs.action_logits as ort.Tensor | undefined;
      if (!logitsTensor) {
        throw new Error('action_logits output이 없습니다.');
      }
    } catch {
      throw new InternalServerErrorException(
        'ONNX 추론 중 오류가 발생했습니다.',
      );
    }

    const logits = Array.from(logitsTensor.data as Float32Array);
    const maskedLogits = applyActionMask(logits, mask);
    const actionIndex = selectAction(maskedLogits);
    const payload = mapActionIndexToPayload(
      actionIndex,
      state,
      model.spec.maxHandSize,
    );

    return { actionIndex, logits, payload };
  }
}

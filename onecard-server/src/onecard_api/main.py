from __future__ import annotations

from typing import Optional

from fastapi import FastAPI

from onecard_api.api import games, onnx_policy
from onecard_api.api.deps import get_service_container
from onecard_api.container import ServiceContainer


def create_app(container: Optional[ServiceContainer] = None) -> FastAPI:
    app = FastAPI(
        title="Onecard API",
        description="REST API specification for the Onecard service",
        version="1.0.0",
    )

    if container is not None:
        app.dependency_overrides[get_service_container] = lambda: container

    app.include_router(games.router)
    app.include_router(onnx_policy.router)

    @app.get("/health", tags=["health"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()

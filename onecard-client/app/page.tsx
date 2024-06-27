"use client"

import GameTitle from "@/stories/UI/GameTitle";
import PixelRetroButton from "@/stories/UI/PixelRetroButton";
import {BackgroundMusic} from "@/stories/GameObject/BackgroudMusic";

export default function MainPage() {
    return (
        <main className="flex min-h-screen w-full items-center justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24">
            <div className="w-full h-full min-h-screen max-w-[95%] sm:max-w-[90%] md:max-w-[1400px] lg:max-w-[1600px] xl:max-w-[1800px] 2xl:max-w-[2000px]
                            bg-[rgba(39,67,42,1)] py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12 2xl:py-16
                            flex flex-col items-center justify-center">
                <BackgroundMusic url="audio/bgm/SHK_055_Cosmic_Rainbow.mp3"
                                 className="absolute top-4 right-12 sm:top-4 sm:right-20 md:top-4 md:right-16 lg:top-4 lg:right-20 xl:top-4 xl:right-24 2xl:top-4 2xl:right-28 z-10"/>
                <GameTitle
                    title="ONE CARD"
                    subtitle="WEB GAME"
                />
                <PixelRetroButton
                    text="START GAME"
                />
            </div>
        </main>
    );
}
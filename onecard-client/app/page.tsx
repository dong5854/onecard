import Link from "next/link"
import GameTitle from "@/components/UI/GameTitle";
import PixelRetroButton from "@/components/UI/PixelRetroButton";

export default function MainPage() {
    return (
        <div className="flex flex-col justify-center items-center mb-40">
            <GameTitle
                title="ONE CARD"
                subtitle="WEB GAME"
            />
            <Link href="/game/single-player">
                <PixelRetroButton
                    text="START GAME"
                    className="mt-6"
                />
            </Link>
        </div>
    );
}
import GameTitle from "@/stories/UI/GameTitle";
import PixelRetroButton from "@/stories/UI/PixelRetroButton";

export default function MainPage() {
    return (
        <>
            <GameTitle
                title="ONE CARD"
                subtitle="WEB GAME"
            />
            <PixelRetroButton
                text="START GAME"
                className="mt-6"
            />
        </>
    );
}
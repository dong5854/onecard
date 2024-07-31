import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { BackgroundMusic } from "@/components/GameObject/BackgroudMusic";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Create Next App",
    description: "Generated by create next app",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${inter.className} flex min-h-screen w-full flex-col items-center justify-start px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24`}>
            <main className="w-full h-full flex flex-grow flex-col max-w-[95%] sm:max-w-[90%] md:max-w-[1400px] lg:max-w-[1600px] xl:max-w-[1800px] 2xl:max-w-[2000px]
                          bg-[rgba(39,67,42,1)]">
                <nav className="w-full p-4">
                    <div className="container mx-auto flex justify-end items-center mr-2">
                        <BackgroundMusic
                            url="audio/bgm/SHK_055_Cosmic_Rainbow.mp3"
                            className="z-10"
                        />
                    </div>
                </nav>
                <div className="flex flex-col flex-grow items-center justify-center">
                    {children}
                </div>
            </main>
        </body>
        </html>
    );
}
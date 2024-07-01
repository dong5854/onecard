import GameTitle from "@/stories/UI/GameTitle";
import PokerCard from "@/stories/GameObject/PokerCard";

interface RectangleProps {
        orientation: 'horizontal' | 'vertical';
}

const Rectangle: React.FC<RectangleProps> = ({ orientation }) => (
    <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className={`${orientation === 'horizontal' ? 'w-full h-1/2' : 'w-1/2 h-full'} bg-blue-500 rounded-lg flex items-center justify-center text-white`}>
                    {orientation === 'horizontal' ? 'H' : 'V'}
            </div>
    </div>
);

export default function SinglePlayerPage() {
        return (
            <div className="w-full h-full flex items-center justify-center">
                    <div className="aspect-square w-full max-w-[150vh] max-h-[85vh] grid grid-cols-9 grid-rows-9 gap-0.5">
                            <div className="bg-gray-100 flex items-center justify-center col-span-2 row-span-2">1-2-10-11</div>
                            <div className="bg-gray-100 flex items-center justify-center col-span-5 row-span-2">
                                    <Rectangle orientation="horizontal"/>
                            </div>
                            <div className="bg-gray-100 flex items-center justify-center col-span-2 row-span-2">8-9-17-18</div>
                            <div className="bg-gray-100 flex items-center justify-center row-span-5 col-span-2">
                                    <Rectangle orientation="vertical"/>
                            </div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">20</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">21</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">22</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">23</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">24</div>
                            <div className="bg-gray-100 flex items-center justify-center row-span-5 col-span-2">
                                    <Rectangle orientation="vertical"/>
                            </div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">29</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs col-span-3 row-span-3">
                                    <PokerCard isJoker={false} isFlipped={true} />
                            </div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">33</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">38</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">42</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">47</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">51</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">56</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">57</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">58</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">59</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">60</div>
                            <div className="bg-gray-100 flex items-center justify-center col-span-2 row-span-2">63-64-73-74</div>
                            <div className="bg-gray-100 flex items-center justify-center col-span-5 row-span-2">
                                    <Rectangle orientation="horizontal"/>
                            </div>
                            <div className="bg-gray-100 flex items-center justify-center col-span-2 row-span-2">71-72-80-81</div>
                    </div>
            </div>
        );
}
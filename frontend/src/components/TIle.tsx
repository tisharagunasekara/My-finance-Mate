import React from "react";
import { IconType } from "react-icons";

interface TileProps {
  title: string;
  count: number;
  icon: IconType;
  className?: string;
  formatter?: (value: number) => string;
}

const Tile: React.FC<TileProps> = ({ title, count, icon: Icon, className, formatter }) => {
  const displayValue = formatter ? formatter(count) : count.toString();
  
  return (
    <div className={`p-6 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{displayValue}</p>
        </div>
        <div className="bg-gray-100 p-3 rounded-full">
          <Icon className="h-6 w-6 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default Tile;

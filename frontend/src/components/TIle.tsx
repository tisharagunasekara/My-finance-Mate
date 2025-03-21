import React from "react";

interface TotalCountTileProps {
  title: string;
  count: number;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const TotalCountTile: React.FC<TotalCountTileProps> = ({ title, count, icon: Icon }) => {
  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 flex items-center space-x-4 w-60">
      {Icon && <Icon className="w-12 h-12 text-blue-500" />}
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h2 className="text-2xl font-bold text-gray-800">{count}</h2>
      </div>
    </div>
  );
};

export default TotalCountTile;

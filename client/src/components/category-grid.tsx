import { RELIGIONS } from "@shared/schema";

interface CategoryGridProps {
  onCategoryClick: (religion: string) => void;
}

export default function CategoryGrid({ onCategoryClick }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6" data-testid="category-grid">
      {RELIGIONS.map((religion) => (
        <div 
          key={religion}
          className="text-center group cursor-pointer"
          onClick={() => onCategoryClick(religion)}
          data-testid={`category-${religion.toLowerCase()}`}
        >
          <div className="bg-card rounded-2xl p-6 border group-hover:shadow-lg transition-all duration-200">
            <h3 className="font-semibold text-foreground" data-testid={`text-${religion.toLowerCase()}`}>
              {religion}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
}

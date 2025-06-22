import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Clock, MapPin } from 'lucide-react';

interface DigitalTwin {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

interface DigitalTwinCardProps {
  twin: DigitalTwin;
}

const gradientVariants = [
  'from-blue-50 to-indigo-100 border-blue-200 dark:from-blue-950 dark:to-indigo-900 dark:border-blue-800',
  'from-green-50 to-emerald-100 border-green-200 dark:from-green-950 dark:to-emerald-900 dark:border-green-800', 
  'from-purple-50 to-violet-100 border-purple-200 dark:from-purple-950 dark:to-violet-900 dark:border-purple-800',
  'from-orange-50 to-amber-100 border-orange-200 dark:from-orange-950 dark:to-amber-900 dark:border-orange-800',
  'from-pink-50 to-rose-100 border-pink-200 dark:from-pink-950 dark:to-rose-900 dark:border-pink-800',
  'from-teal-50 to-cyan-100 border-teal-200 dark:from-teal-950 dark:to-cyan-900 dark:border-teal-800',
];

const tagVariants = [
  'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200',
  'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200',
  'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-200',
  'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200',
  'bg-pink-100 text-pink-800 hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200',
  'bg-teal-100 text-teal-800 hover:bg-teal-200 dark:bg-teal-900 dark:text-teal-200',
];

export default function DigitalTwinCard({ twin }: DigitalTwinCardProps) {
  // Use twin.id to consistently assign colors
  const gradientIndex = parseInt(twin.id.slice(-1)) % gradientVariants.length;
  const gradientClass = gradientVariants[gradientIndex];

  const getRiskColor = (tag: string) => {
    if (tag.toLowerCase().includes('high risk')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (tag.toLowerCase().includes('medium risk')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    if (tag.toLowerCase().includes('low risk')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    return tagVariants[Math.floor(Math.random() * tagVariants.length)];
  };

  return (
    <Link href={`/digital-twin?twinId=${twin.id}`}>
      <Card className={`hover:shadow-2xl hover:shadow-black/10 hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full bg-gradient-to-br ${gradientClass} border-2 hover:border-opacity-60 group relative overflow-hidden backdrop-blur-sm`}>
        {/* Subtle animated gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        
        {/* Floating action indicator */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
            <ArrowRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
          </div>
        </div>
        
        <CardHeader className="relative z-10 pb-3">
          <CardTitle className="text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200 flex items-start justify-between pr-12">
            <span className="line-clamp-2">{twin.name}</span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200 line-clamp-2">
            {twin.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10 pt-0">
          <div className="flex flex-wrap gap-2">
            {twin.tags.map((tag, index) => {
              const isRiskTag = tag.toLowerCase().includes('risk');
              const tagClass = isRiskTag ? getRiskColor(tag) : tagVariants[index % tagVariants.length];
              const isDateTag = /\w{3}-\d{4}/.test(tag); // Matches format like "Jun-2024"
              
              return (
                <Badge 
                  key={tag} 
                  className={`${tagClass} transition-all duration-200 border-0 font-medium text-xs px-2 py-1 flex items-center gap-1`}
                >
                  {isDateTag && <Clock className="h-3 w-3" />}
                  {tag}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 
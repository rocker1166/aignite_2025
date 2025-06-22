import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
  'from-blue-50 to-indigo-100 border-blue-200',
  'from-green-50 to-emerald-100 border-green-200', 
  'from-purple-50 to-violet-100 border-purple-200',
  'from-orange-50 to-amber-100 border-orange-200',
  'from-pink-50 to-rose-100 border-pink-200',
  'from-teal-50 to-cyan-100 border-teal-200',
];

const tagVariants = [
  'bg-blue-100 text-blue-800 hover:bg-blue-200',
  'bg-green-100 text-green-800 hover:bg-green-200',
  'bg-purple-100 text-purple-800 hover:bg-purple-200',
  'bg-orange-100 text-orange-800 hover:bg-orange-200',
  'bg-pink-100 text-pink-800 hover:bg-pink-200',
  'bg-teal-100 text-teal-800 hover:bg-teal-200',
];

export default function DigitalTwinCard({ twin }: DigitalTwinCardProps) {
  // Use twin.id to consistently assign colors
  const gradientIndex = parseInt(twin.id.slice(-1)) % gradientVariants.length;
  const gradientClass = gradientVariants[gradientIndex];

  return (
    <Link href={`/digital-twin?twinId=${twin.id}`}>
      <Card className={`hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full bg-gradient-to-br ${gradientClass} border-2 hover:border-opacity-60 group relative overflow-hidden`}>
        {/* Subtle animated gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        
        <CardHeader className="relative z-10">
          <CardTitle className="text-gray-800 group-hover:text-gray-900 transition-colors duration-200">
            {twin.name}
          </CardTitle>
          <CardDescription className="text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
            {twin.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex flex-wrap gap-2">
            {twin.tags.map((tag, index) => {
              const tagVariantIndex = index % tagVariants.length;
              const tagClass = tagVariants[tagVariantIndex];
              return (
                <Badge 
                  key={tag} 
                  className={`${tagClass} transition-all duration-200 border-0 font-medium`}
                >
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
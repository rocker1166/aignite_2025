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

export default function DigitalTwinCard({ twin }: DigitalTwinCardProps) {
  return (
    <Link href={`/digital-twin?twinId=${twin.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full">
        <CardHeader>
          <CardTitle>{twin.name}</CardTitle>
          <CardDescription>{twin.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {twin.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 
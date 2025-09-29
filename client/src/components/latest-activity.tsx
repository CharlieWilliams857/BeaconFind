import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface ActivityItem {
  id: string;
  userName: string;
  action: string;
  faithGroupName: string;
  timeAgo: string;
  reviewSnippet: string;
  rating: number;
  imageUrl: string;
}

// Sample activity data to match Figma design
const SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    userName: "Miriam R.",
    action: "wrote a review",
    faithGroupName: "Temple Beth El",
    timeAgo: "18 minutes ago",
    reviewSnippet: "A warm and welcoming community. The sermons are always thought-provoking and the community is very supportive.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=300&h=200&fit=crop"
  },
  {
    id: "2", 
    userName: "Abdul M.",
    action: "wrote a review",
    faithGroupName: "Al-Falaah Mosque",
    timeAgo: "10 minutes ago",
    reviewSnippet: "The atmosphere during Friday prayers is uplifting, and the community outreach programs are excellent.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=300&h=200&fit=crop"
  },
  {
    id: "3",
    userName: "Sarah T.", 
    action: "wrote a review",
    faithGroupName: "Grace Church",
    timeAgo: "5 minutes ago",
    reviewSnippet: "An incredible place to find peace and solace. The choir's performances during Sunday service are beautiful.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop"
  },
  {
    id: "4",
    userName: "David W.",
    action: "wrote a review", 
    faithGroupName: "Congregation Shaare Shalom",
    timeAgo: "2 minutes ago",
    reviewSnippet: "The educational programs for children are outstanding and engaging. Great community involvement.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=300&h=200&fit=crop"
  },
  {
    id: "5",
    userName: "Laura H.",
    action: "wrote a review",
    faithGroupName: "St. Mark's Cathedral", 
    timeAgo: "1 minute ago",
    reviewSnippet: "A beautiful place for reflection and worship. The architecture is stunning and the services are meaningful.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=300&h=200&fit=crop"
  },
  {
    id: "6",
    userName: "Mohammed A.",
    action: "wrote a review",
    faithGroupName: "Islamic Center Of Peace",
    timeAgo: "3 minutes ago",
    reviewSnippet: "The community events are enriching and the speakers always deliver inspiring messages. Highly recommend.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1564769625905-50e93615e769?w=300&h=200&fit=crop"
  },
  {
    id: "7",
    userName: "Emily P.",
    action: "wrote a review",
    faithGroupName: "Unity Temple",
    timeAgo: "4 minutes ago",
    reviewSnippet: "A diverse and inclusive space where everyone feels welcome. The community feels like family.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&h=200&fit=crop"
  },
  {
    id: "8",
    userName: "James K.",
    action: "wrote a review",
    faithGroupName: "Christ The King Church",
    timeAgo: "6 minutes ago",
    reviewSnippet: "The youth programs are exceptional, fostering fellowship and spiritual growth among young members.",
    rating: 5,
    imageUrl: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=300&h=200&fit=crop"
  }
];

const StarRating = ({ rating, activityId }: { rating: number; activityId: string }) => {
  return (
    <div className="flex items-center mb-2" data-testid={`rating-faith-group-${activityId}`}>
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
        />
      ))}
    </div>
  );
};

export default function LatestActivity() {
  return (
    <section className="py-16 px-4" data-testid="latest-activity">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-activity-title">
          Latest Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {SAMPLE_ACTIVITIES.map((activity) => (
            <Card key={activity.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`activity-card-${activity.id}`}>
              <CardContent className="p-0">
                {/* User Info Header */}
                <div className="p-4 pb-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
                        {activity.userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium text-foreground" data-testid={`user-name-${activity.id}`}>
                          {activity.userName}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground" data-testid={`time-${activity.id}`}>
                        {activity.timeAgo}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Faith Group Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={activity.imageUrl} 
                    alt={activity.faithGroupName}
                    className="w-full h-full object-cover"
                    data-testid={`img-faith-group-${activity.id}`}
                  />
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <StarRating rating={activity.rating} activityId={activity.id} />
                  
                  <h3 className="font-semibold text-lg text-foreground mb-2" data-testid={`faith-group-${activity.id}`}>
                    {activity.faithGroupName}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3" data-testid={`review-snippet-${activity.id}`}>
                    {activity.reviewSnippet}
                  </p>
                  
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-primary text-sm font-medium hover:underline"
                    data-testid={`read-more-${activity.id}`}
                  >
                    Read more
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
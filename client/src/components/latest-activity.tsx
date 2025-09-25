import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface ActivityItem {
  id: string;
  userName: string;
  action: string;
  faithGroupName: string;
  timeAgo: string;
  reviewSnippet: string;
}

// Sample activity data to match Figma design
const SAMPLE_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    userName: "Dan S.",
    action: "wrote a review",
    faithGroupName: "St. James Church",
    timeAgo: "24 minutes ago",
    reviewSnippet: "Overall great experience here. The main floor and basement were packed, but the dining room"
  },
  {
    id: "2", 
    userName: "Dan S.",
    action: "wrote a review",
    faithGroupName: "St. James Church",
    timeAgo: "24 minutes ago",
    reviewSnippet: "Overall great experience here. The main floor and basement were packed, but the dining room"
  },
  {
    id: "3",
    userName: "Dan S.", 
    action: "wrote a review",
    faithGroupName: "St. James Church",
    timeAgo: "24 minutes ago",
    reviewSnippet: "Overall great experience here. The main floor and basement were packed, but the dining room"
  },
  {
    id: "4",
    userName: "Dan S.",
    action: "wrote a review", 
    faithGroupName: "St. James Church",
    timeAgo: "24 minutes ago",
    reviewSnippet: "Overall great experience here. The main floor and basement were packed, but the dining room"
  },
  {
    id: "5",
    userName: "Dan S.",
    action: "wrote a review",
    faithGroupName: "St. James Church", 
    timeAgo: "24 minutes ago",
    reviewSnippet: "Overall great experience here. The main floor and basement were packed, but the dining room"
  },
  {
    id: "6",
    userName: "Dan S.",
    action: "wrote a review",
    faithGroupName: "St. James Church",
    timeAgo: "24 minutes ago", 
    reviewSnippet: "Overall great experience here. The main floor and basement were packed, but the dining room"
  }
];

export default function LatestActivity() {
  return (
    <section className="py-16 px-4" data-testid="latest-activity">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12" data-testid="text-activity-title">
          Latest Activity
        </h2>
        <div className="flex items-center gap-6" style={{gap: '24px'}}>
          {SAMPLE_ACTIVITIES.map((activity) => (
            <Card key={activity.id} className="activity-card" data-testid={`activity-card-${activity.id}`}>
              <CardContent className="">
                <div className="flex items-start space-x-3 mb-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                      {activity.userName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm">
                      <span className="font-medium text-foreground" data-testid={`user-name-${activity.id}`}>
                        {activity.userName}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        {activity.action}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground" data-testid={`time-${activity.id}`}>
                      {activity.timeAgo}
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-2" data-testid={`faith-group-${activity.id}`}>
                    {activity.faithGroupName}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`review-snippet-${activity.id}`}>
                    {activity.reviewSnippet}
                  </p>
                </div>
                
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-primary text-sm font-medium"
                  data-testid={`read-more-${activity.id}`}
                >
                  Read more
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
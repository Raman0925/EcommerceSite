"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, User } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import { getReviews } from "@/lib/actions/review.action";
import { Review } from "@/types";
import Rating from "@/components/shared/product/rating";
import ReviewForm from "./review-form";

const ReviewList = ({
  userId,
  productId,
  productSlug,
}: {
  userId: string;
  productId: string;
  productSlug: string;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({ productId });
      setReviews(res.data as Review[]);
    };

    loadReviews();
  }, [productId]);

  // Reload reviews when a review is submitted
  const reload = async () => {
    try {
      const res = await getReviews({ productId });
      setReviews([...((res.data as Review[]) || [])]);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Error in fetching reviews",
      });
    }
  };

  return (
    <div className="space-y-4">
      {reviews.length === 0 && <div>No reviews yet</div>}
      {userId ? (
        <ReviewForm
          userId={userId}
          productId={productId}
          onReviewSubmitted={reload}
        />
      ) : (
        <div>
          Please{" "}
          <Link
            className="text-primary px-2"
            href={`/api/auth/signin?callbackUrl=/product/${productSlug}`}
          >
            sign in
          </Link>{" "}
          to write a review
        </div>
      )}
      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className="flex-between">
                <CardTitle>{review.title}</CardTitle>
              </div>
              <CardDescription>{review.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Rating value={review.rating} />
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <User className="mr-1 h-3 w-3" />
                    {review.user ? review.user.name : "Deleted User"}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatDateTime(review.createdAt).dateTime}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;

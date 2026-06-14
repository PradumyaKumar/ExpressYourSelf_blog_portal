import Link from "next/link";
import React from "react";
import { Card } from "./ui/card";
import { Calendar } from "lucide-react";
import moment from "moment";

interface BlogCardProps {
  image: string;
  title: string;
  desc: string;
  id: string;
  time: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  image,
  title,
  desc,
  id,
  time,
}) => {
  return (
    <Link href={`/blog/${id}`}>
      <Card className="group overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/45 hover:shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
        <div className="w-full h-[200px]">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>

        <div className="p-5">
          <div>
            <p className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Calendar size={16} />
              <span>{moment(time).format("DD-MM-YYYY")}</span>
            </p>
            <h2 className="text-lg font-semibold mt-3 line-clamp-1 text-center text-foreground">
              {title}
            </h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {desc.slice(0, 54)}...
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default BlogCard;

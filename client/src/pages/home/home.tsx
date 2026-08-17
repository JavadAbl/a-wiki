import HomeHero from "./components/home-hero";
import HeroFeatures from "./components/home-features";
import HomeCourses from "./components/home-courses";
import { cn } from "#lib/utils";
import HomeCategories from "./components/home-categories";

export default function Home() {
  return (
    <div className={cn("fade-in")}>
      <HomeHero />
      <HomeCategories />
      <HeroFeatures />

      <HomeCourses />
    </div>
  );
}

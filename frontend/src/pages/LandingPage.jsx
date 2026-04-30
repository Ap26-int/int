import { useEffect } from "react";
import Preloader from "../components/Preloader";
import Header from "../components/Header";
import Hero from "../components/Hero";
import About from "../components/About";
import Services from "../components/Services";
import Portfolio from "../components/Portfolio";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import ContactCTA from "../components/ContactCTA";
import Footer from "../components/Footer";

export default function LandingPage() {
  useEffect(() => {
    document.title = "Lumière By Sambita Bose · Luxury Interior Design";
  }, []);

  return (
    <main data-testid="landing-page" className="bg-[hsl(var(--obsidian))]">
      <Preloader />
      <Header />
      <Hero />
      <About />
      <Services />
      <Portfolio />
      <WhyChooseUs />
      <Testimonials />
      <ContactCTA />
      <Footer />
    </main>
  );
}

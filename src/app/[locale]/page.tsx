import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { Values } from '@/components/sections/Values';
import { CallToAction } from '@/components/sections/CallToAction';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Values />
      <CallToAction />
    </>
  );
}

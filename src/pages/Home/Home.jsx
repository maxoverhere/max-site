import ThrowableBanner from "../../components/ThrowableBanner/ThrowableBanner";
import pearImage from "../../assets/images/Pear.png";
import shoeImage from "../../assets/images/shoe.png";
import motorbikeImage from "../../assets/images/Motorbike.png";
import "./home.css";

const ASSETS = [pearImage, shoeImage, motorbikeImage];

export default function Home() {
  return (
    <main className="page page--home">
      <section className="hero hero--center">
        <h1 className="hero__title">Welcome to max-site</h1>
        <p className="hero__subtitle lead">
          Play with ideas, games, and projects — all in one place.
        </p>
        <ThrowableBanner assets={ASSETS} />
      </section>
    </main>
  );
}

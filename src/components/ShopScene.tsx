import { SceneImage } from "./SceneImage";

export function ShopScene() {
  return (
    <div className="shop-scene" aria-hidden="true">
      <SceneImage
        alt=""
        className="shop-scene-image"
        fallbackClass="interior-fallback"
        src="/images/shop-interior-main.jpg"
      />
      <div className="shop-scene-shade" />
      <div className="lamp"><span /></div>
    </div>
  );
}

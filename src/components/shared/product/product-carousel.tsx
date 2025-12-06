import Image from "next/image";
import Link from "next/link";

import { Product } from "@/types";

const ProductCarousel = ({ data }: { data: Product[] }) => {
  if (!data.length) {
    return null;
  }

  return (
    <div className="w-full mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((product) => (
        <Link key={product.id} href={`/product/${product.slug}`}>
          <div className="relative w-full overflow-hidden rounded-lg border">
            {product.banner ? (
              <Image
                alt={product.name}
                src={product.banner}
                width={1920}
                height={680}
                className="w-full h-48 md:h-64 object-cover"
              />
            ) : (
              <div className="w-full h-48 md:h-64 bg-muted flex items-center justify-center">
                <span className="text-lg font-semibold">{product.name}</span>
              </div>
            )}
            <div className="absolute inset-0 flex items-end justify-center">
              <h2 className="bg-gray-900/60 text-2xl font-bold px-3 py-1 text-white mb-4 rounded">
                {product.name}
              </h2>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductCarousel;

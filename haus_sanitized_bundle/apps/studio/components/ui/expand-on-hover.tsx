
"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
// Swiper CSS is not used in this specific component logic, commenting out to avoid load errors in this environment
// import "swiper/css";
// import "swiper/css/effect-creative";
// import "swiper/css/pagination";
// import "swiper/css/autoplay";

import { cn } from "../../lib/utils";

const Skiper52 = () => {
  const images = [
    {
      src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800",
      alt: "Mountain landscape",
      address: "12 Alpine Ridge, Snowy Mountains",
    },
    {
      src: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800",
      alt: "Abstract illustration",
      address: "88 Geometric Ave, Design District",
    },
    {
      src: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=800",
      alt: "City skyline at night",
      address: "42 Skyline Blvd, Metro City",
    },
    {
      src: "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=800",
      alt: "Modern architecture",
      address: "101 Glass House Ln, Architecture Park",
    },
    {
      src: "https://images.unsplash.com/photo-1521747116042-5a810fda9664?w=800",
      alt: "Laptop workspace",
      address: "5 Creative Commons, Tech Hub",
    },
    {
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      alt: "Ocean waves",
      address: "7 Azure Coast, Beachfront",
    },
    {
      src: "https://images.unsplash.com/photo-1754136362561-fd8b431c78e4?q=80&w=1065&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      alt: "Forest path",
      address: "23 Fern Gully, Rainforest Estate",
    },
    {
      src: "https://images.unsplash.com/photo-1499673610122-01c7122c5dcb?w=800",
      alt: "Colorful building",
      address: "19 Spectrum St, Arts Quarter",
    },
    {
      src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800",
      alt: "Sunset view",
      address: "Sunset Boulevard, West Coast",
    },
  ];

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden bg-[#f5f4f3]">
      <HoverExpand_001 className="" images={images} />
    </div>
  );
};

export { Skiper52 };

const HoverExpand_001 = ({
  images,
  className,
}: {
  images: { src: string; alt: string; address: string }[];
  className?: string;
}) => {
  const [activeImage, setActiveImage] = useState<number | null>(1);

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        duration: 0.3,
        delay: 0.5,
      }}
      className={cn("relative w-full max-w-6xl px-5", className)}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <div className="flex w-full items-center justify-center gap-1">
          {images.map((image, index) => (
            <motion.div
              key={index}
              className="relative cursor-pointer overflow-hidden rounded-3xl"
              initial={{ width: "2.5rem", height: "20rem" }}
              animate={{
                width: activeImage === index ? "24rem" : "5rem",
                height: activeImage === index ? "24rem" : "24rem",
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => setActiveImage(index)}
              onHoverStart={() => setActiveImage(index)}
            >
              <AnimatePresence>
                {activeImage === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute h-full w-full bg-gradient-to-t from-black/80 to-transparent"
                  />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {activeImage === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col justify-end p-6"
                  >
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-xl inline-block">
                        <p className="text-white font-bold text-lg leading-tight">
                        {image.address}
                        </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <img
                src={image.src}
                className="size-full object-cover"
                alt={image.alt}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export { HoverExpand_001 };

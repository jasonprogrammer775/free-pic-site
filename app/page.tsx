"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";

interface Image {
  id: number;
  webformatURL: string;
  tags: string;
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [images, setImages] = useState<Image[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("nature");
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const [fileFormat, setFileFormat] = useState<"jpg" | "png">("jpg");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchImages = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://pixabay.com/api/?key=49055648-29167078f83e74b1df616ded0&q=${searchQuery}&image_type=photo&page=${pageNumber}`
      );
      const newImages = response.data.hits;

      if (newImages.length === 0) {
        setHasMore(false);
      }

      setImages((prevImages) => [...prevImages, ...newImages]);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages(page);
  }, [searchQuery]);

  useEffect(() => {
    if (page > 1) {
      fetchImages(page);
    }
  }, [page]);

  const fetchMoreData = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setImages([]);
    setPage(1);
    setHasMore(true);
  };

  const downloadImage = async (url: string, id: number, format: "jpg" | "png") => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();

      if (format === "png") {
        const imageBitmap = await createImageBitmap(blob);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (ctx) {
          canvas.width = imageBitmap.width;
          canvas.height = imageBitmap.height;
          ctx.drawImage(imageBitmap, 0, 0);

          const pngURL = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.href = pngURL;
          link.download = `image-${id}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Download as JPG
        const objectURL = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectURL;
        link.download = `image-${id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectURL);
      }
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Free Images from Pixabay</h1>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for images..."
          className="w-full p-2 border border-gray-300 rounded-lg"
        />

        <select
          value={fileFormat}
          onChange={(e) => setFileFormat(e.target.value as "jpg" | "png")}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="jpg">JPG</option>
          <option value="png">PNG</option>
        </select>
      </div>

      {loading && <p>Loading images...</p>}

      <InfiniteScroll
        dataLength={images.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<p>Loading more images...</p>}
        endMessage={<p>No more images to load</p>}
        scrollThreshold={0.95}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={`${image.id}-${index}`}
              className="relative group"
              onMouseEnter={() => setHoveredImage(image.id)}
              onMouseLeave={() => setHoveredImage(null)}
            >
              <img
                src={image.webformatURL}
                alt={image.tags}
                className="w-full h-auto rounded-lg shadow-lg transition-transform duration-300 transform group-hover:scale-105"
              />

              {hoveredImage === image.id && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center rounded-lg">
                  <p className="text-white text-sm mb-2">Download</p>
                  <button
                    onClick={() => downloadImage(image.webformatURL, image.id, fileFormat)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center"
                  >
                    <span className="mr-1">↓</span> Save as {fileFormat.toUpperCase()}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
}








import { useState } from "react";

/**
 * ImageCarousel component for property images and video with modal slideshow
 */
const ImageCarousel = ({ images, video }: { images: string[]; video?: string | null }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [modalActive, setModalActive] = useState(false);
  const [modalSlide, setModalSlide] = useState(0);
  
  const mediaItems = [...(images || [])];
  if (video) mediaItems.unshift(video);

  // Handle empty media
  if (mediaItems.length === 0) {
    return (
      <div className="bg-gray-200 h-96 flex items-center justify-center rounded-lg">
        <p className="text-gray-500">لا توجد صور متاحة</p>
      </div>
    );
  }

  const openModal = (index: number) => {
    setModalSlide(index);
    setModalActive(true);
  };

  const closeModal = () => {
    setModalActive(false);
  };

  const nextModalSlide = () => {
    setModalSlide((modalSlide + 1) % mediaItems.length);
  };

  const prevModalSlide = () => {
    setModalSlide((modalSlide - 1 + mediaItems.length) % mediaItems.length);
  };

  return (
    <div className="relative">
      <div className="carousel w-full h-96 md:h-150 rounded-lg overflow-hidden shadow-xl mb-4">
        {mediaItems.map((item, index) => (
          <div
            key={index}
            id={`slide-${index}`}
            className={`carousel-item relative w-full ${activeSlide === index ? 'block' : 'hidden'}`}
          >
            {item.includes('.mp4') ? (
              <video 
                className="w-full h-full object-cover" 
                controls
                src={item.startsWith('http') ? item : `https://placehold.co/600x400?text=فيديو+غير+متاح`}
              />
            ) : (
              <div className="relative cursor-pointer" onClick={() => openModal(index)}>
                <img
                  src={item.startsWith('http') ? item : `https://placehold.co/600x400?text=صورة+غير+متاحة`}
                  className="w-full h-full object-cover"
                  alt={`صورة العقار ${index + 1}`}
                />
                <div className="absolute inset-0 bg-black opacity-0 hover:opacity-10 transition-opacity flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            )}
            <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2">
              <button 
                className="btn btn-circle bg-white/70 hover:bg-white" 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide((activeSlide - 1 + mediaItems.length) % mediaItems.length);
                }}
              >
                ❮
              </button>
              <button 
                className="btn btn-circle bg-white/70 hover:bg-white" 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide((activeSlide + 1) % mediaItems.length);
                }}
              >
                ❯
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Thumbnail navigation */}
      <div className="flex justify-center mt-4 gap-2 overflow-x-auto py-2">
        {mediaItems.map((item, index) => (
          <button
            key={`thumb-${index}`}
            onClick={() => setActiveSlide(index)}
            className={`w-16 h-16 rounded-md overflow-hidden border-2 ${activeSlide === index ? 'border-primary' : 'border-transparent'}`}
          >
            {item.includes('.mp4') ? (
              <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                <span className="text-xs">فيديو</span>
              </div>
            ) : (
              <img 
                src={item.startsWith('http') ? item : `https://placehold.co/100x100?text=صورة`} 
                className="w-full h-full object-cover"
                alt={`صورة مصغرة ${index + 1}`}
              />
            )}
          </button>
        ))}
      </div>

      {/* Modal Slideshow */}
      <dialog className={`modal ${modalActive ? 'modal-open' : ''}`} onClick={closeModal}>
        <div className="modal-box max-w-5xl p-0 bg-transparent" onClick={(e) => e.stopPropagation()}>
          <div className="relative bg-black rounded-lg overflow-hidden">
            {/* Close button */}
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 z-20 text-white bg-black/50" 
              onClick={closeModal}
            >
              ✕
            </button>
            
            {/* Modal slides */}
            {mediaItems.map((item, index) => (
              <div 
                key={`modal-slide-${index}`} 
                className={`w-full ${modalSlide === index ? 'block' : 'hidden'}`}
              >
                {item.includes('.mp4') ? (
                  <video 
                    className="w-full max-h-[80vh] object-contain" 
                    controls
                    autoPlay
                    src={item.startsWith('http') ? item : `https://placehold.co/1200x800?text=فيديو+غير+متاح`}
                  />
                ) : (
                  <img
                    src={item.startsWith('http') ? item : `https://placehold.co/1200x800?text=صورة+غير+متاحة`}
                    className="w-full max-h-[80vh] object-contain"
                    alt={`صورة العقار ${index + 1}`}
                  />
                )}
              </div>
            ))}
            
            {/* Modal navigation controls */}
            <div className="absolute flex justify-between transform -translate-y-1/2 left-5 right-5 top-1/2 z-10">
              <button 
                className="btn btn-circle btn-lg bg-black/30 hover:bg-black/50 text-white border-none" 
                onClick={(e) => {
                  e.stopPropagation();
                  prevModalSlide();
                }}
              >
                ❮
              </button>
              <button 
                className="btn btn-circle btn-lg bg-black/30 hover:bg-black/50 text-white border-none" 
                onClick={(e) => {
                  e.stopPropagation();
                  nextModalSlide();
                }}
              >
                ❯
              </button>
            </div>

            {/* Modal thumbnails */}
            <div className="bg-black/80 p-2">
              <div className="flex justify-center gap-2 overflow-x-auto p-2">
                {mediaItems.map((item, index) => (
                  <button
                    key={`modal-thumb-${index}`}
                    onClick={() => setModalSlide(index)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 ${modalSlide === index ? 'border-primary' : 'border-gray-700'}`}
                  >
                    {item.includes('.mp4') ? (
                      <div className="bg-gray-800 w-full h-full flex items-center justify-center">
                        <span className="text-xs text-white">فيديو</span>
                      </div>
                    ) : (
                      <img 
                        src={item.startsWith('http') ? item : `https://placehold.co/100x100?text=صورة`} 
                        className="w-full h-full object-cover"
                        alt={`صورة مصغرة ${index + 1}`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={closeModal}>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default ImageCarousel;
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SummaryApi from "../common";
import { FaStar } from "react-icons/fa";
import { FaStarHalf } from "react-icons/fa";
import displayINRCurrency from "../helpers/displayCurrency";
import CategroyWiseProductDisplay from "../components/CategoryWiseProductDisplay";
import addToCart from "../helpers/addToCart";
import Context from "../context";
import { FaRegCircleUser } from "react-icons/fa6";

const ProductDetails = () => {
  const [totalRatings, setTotalRatings] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [data, setData] = useState({
    productName: "",
    brandName: "",
    category: "",
    productImage: [],
    description: "",
    price: "",
    sellingPrice: "",
  });
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const productImageListLoading = new Array(4).fill(null);
  const [activeImage, setActiveImage] = useState("");

  const [zoomImageCoordinate, setZoomImageCoordinate] = useState({
    x: 0,
    y: 0,
  });
  const [zoomImage, setZoomImage] = useState(false);

  const { fetchUserAddToCart } = useContext(Context);

  const navigate = useNavigate();

  const fetchProductDetails = async () => {
    setLoading(true);
    const response = await fetch(SummaryApi.productDetails.url, {
      method: SummaryApi.productDetails.method,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        productId: params?.id,
      }),
    });
    setLoading(false);
    const dataReponse = await response.json();
    setTotalRatings(dataReponse?.totalRatings);
    setAverageRating(dataReponse?.averageRating);
    setData(dataReponse?.data);
    setActiveImage(dataReponse?.data?.productImage[0]);
  };

  useEffect(() => {
    fetchProductDetails();
  }, [params]);

  const handleMouseEnterProduct = (imageURL) => {
    setActiveImage(imageURL);
  };

  const handleZoomImage = useCallback(
    (e) => {
      setZoomImage(true);
      const { left, top, width, height } = e.target.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;

      setZoomImageCoordinate({
        x,
        y,
      });
    },
    [zoomImageCoordinate]
  );

  const handleLeaveImageZoom = () => {
    setZoomImage(false);
  };

  const handleAddToCart = async (e, id) => {
    await addToCart(e, id);
    fetchUserAddToCart();
  };

  const handleBuyProduct = async (e, id) => {
    await addToCart(e, id);
    fetchUserAddToCart();
    navigate("/cart");
  };

  return (
    <div className="container mx-auto p-4">
      <div className="min-h-[200px] flex flex-col lg:flex-row gap-4">
        {/***product Image */}
        <div className="h-96 flex flex-col lg:flex-row-reverse gap-4">
          <div className="h-[300px] w-[300px] lg:h-96 lg:w-96 bg-slate-200 relative p-2">
            <img
              alt="img"
              src={activeImage}
              className="h-full w-full object-scale-down mix-blend-multiply"
              onMouseMove={handleZoomImage}
              onMouseLeave={handleLeaveImageZoom}
            />

            {zoomImage && (
              <div className="hidden lg:block absolute min-w-[500px] overflow-hidden min-h-[400px] bg-slate-200 p-1 -right-[510px] top-0">
                <div
                  className="w-full h-full min-h-[400px] min-w-[500px] mix-blend-multiply scale-150"
                  style={{
                    background: `url(${activeImage})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: `${zoomImageCoordinate.x * 100}% ${
                      zoomImageCoordinate.y * 100
                    }% `,
                  }}
                ></div>
              </div>
            )}
          </div>

          <div className="h-full">
            {loading ? (
              <div className="flex gap-2 lg:flex-col overflow-scroll scrollbar-none h-full">
                {productImageListLoading.map((el, index) => {
                  return (
                    <div
                      className="h-20 w-20 bg-slate-200 rounded animate-pulse"
                      key={"loadingImage" + index}
                    ></div>
                  );
                })}
              </div>
            ) : (
              <div className="flex gap-2 lg:flex-col overflow-scroll scrollbar-none h-full">
                {data?.productImage?.map((imgURL, index) => {
                  return (
                    <div
                      className="h-20 w-20 bg-slate-200 rounded p-1"
                      key={imgURL}
                    >
                      <img
                        alt="img"
                        src={imgURL}
                        className="w-full h-full object-scale-down mix-blend-multiply cursor-pointer"
                        onMouseEnter={() => handleMouseEnterProduct(imgURL)}
                        onClick={() => handleMouseEnterProduct(imgURL)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/***product details */}
        {loading ? (
          <div className="grid gap-1 w-full">
            <p className="bg-slate-200 animate-pulse  h-6 lg:h-8 w-full rounded-full inline-block"></p>
            <h2 className="text-2xl lg:text-4xl font-medium h-6 lg:h-8  bg-slate-200 animate-pulse w-full"></h2>
            <p className="capitalize text-slate-400 bg-slate-200 min-w-[100px] animate-pulse h-6 lg:h-8  w-full"></p>

            <div className="text-red-600 bg-slate-200 h-6 lg:h-8  animate-pulse flex items-center gap-1 w-full"></div>

            <div className="flex items-center gap-2 text-2xl lg:text-3xl font-medium my-1 h-6 lg:h-8  animate-pulse w-full">
              <p className="text-red-600 bg-slate-200 w-full"></p>
              <p className="text-slate-400 line-through bg-slate-200 w-full"></p>
            </div>

            <div className="flex items-center gap-3 my-2 w-full">
              <button className="h-6 lg:h-8  bg-slate-200 rounded animate-pulse w-full"></button>
              <button className="h-6 lg:h-8  bg-slate-200 rounded animate-pulse w-full"></button>
            </div>

            <div className="w-full">
              <p className="text-slate-600 font-medium my-1 h-6 lg:h-8   bg-slate-200 rounded animate-pulse w-full"></p>
              <p className=" bg-slate-200 rounded animate-pulse h-10 lg:h-12  w-full"></p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <p className="bg-red-200 text-red-600 px-2 rounded-full inline-block w-fit">
              {data?.brandName}
            </p>
            <h2 className="text-2xl lg:text-4xl font-medium">
              {data?.productName}
            </h2>
            <p className="capitalize text-slate-400">{data?.category}</p>

            <div className="text-red-600 flex items-center gap-1">
              {[...Array(5)].map((_, index) => {
                if (averageRating >= index + 1) {
                  return <FaStar key={index} />;
                } else if (averageRating > index && averageRating < index + 1) {
                  return <FaStarHalf key={index} />;
                } else {
                  return <FaStar key={index} className="text-gray-300" />;
                }
              })}
              <span className="ml-2 text-slate-500">
                ({totalRatings} reviews)
              </span>
            </div>

            <div className="flex items-center gap-2 text-2xl lg:text-3xl font-medium my-1">
              <p className="text-red-600">
                {displayINRCurrency(data?.sellingPrice)}
              </p>
              <p className="text-slate-400 line-through">
                {displayINRCurrency(data?.price)}
              </p>
            </div>

            <div className="flex items-center gap-3 my-2">
              <button
                className="border-2 border-red-600 rounded px-3 py-1 min-w-[120px] text-red-600 font-medium hover:bg-red-600 hover:text-white"
                onClick={(e) => handleBuyProduct(e, data?._id)}
              >
                Buy
              </button>
              <button
                className="border-2 border-red-600 rounded px-3 py-1 min-w-[120px] font-medium text-white bg-red-600 hover:text-red-600 hover:bg-white"
                onClick={(e) => handleAddToCart(e, data?._id)}
              >
                Add To Cart
              </button>
            </div>

            <div>
              <p className="text-slate-600 font-medium my-1">Description : </p>
              <p>{data?.description}</p>
            </div>
          </div>
        )}
      </div>

      {data?.category && (
        <CategroyWiseProductDisplay
          category={data?.category}
          heading={"Recommended Product"}
        />
      )}

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Customer Reviews
        </h2>
        <div className="space-y-6">
          {data?.reviews && data?.reviews.length > 0 ? (
            data.reviews.map((review, index) => (
              <div
                key={index}
                className="p-4 border-b border-gray-200 last:border-b-0"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
                    <img
                      src={review?.userId?.profilePic || "/default-user.png"}
                      alt="User Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-lg text-gray-800">
                      {review?.userId?.name}
                    </span>
                    <p className="text-sm text-gray-500">
                      {review?.userId?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, starIndex) => (
                    <span key={starIndex}>
                      {review?.rating > starIndex ? (
                        <FaStar className="text-yellow-500" />
                      ) : (
                        <FaStar className="text-gray-300" />
                      )}
                    </span>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    ({review?.rating})
                  </span>
                </div>
                <p className="text-gray-700 text-[16px] mb-4">
                  {review?.review}
                </p>
                {review?.isAdminReplied && review?.adminReply && (
                  <div className="bg-gray-100 p-4 border-l-4 border-red-500 rounded-lg mt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-400">
                        <img
                          src={
                            review?.adminId?.profilePic || "/admin-avatar.png"
                          }
                          alt="Admin Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-red-600 flex items-center gap-2">
                          {review?.adminId?.name || "Admin"}
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-md">
                            Administrator
                          </span>
                        </span>
                        <p className="text-xs text-gray-600">
                          {review?.adminId?.email || "admin@example.com"}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-800 text-[15px]">
                      {review?.adminReply}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No reviews yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

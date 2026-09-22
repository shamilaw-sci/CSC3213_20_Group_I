"use client";

import Image from "next/image";
import { useCartContext } from "@/features/cart/context/CartContext";

export default function CheckoutPage() {

  const { cart, totalPrice } = useCartContext();

  const tax = totalPrice * 0.08;
  const total = totalPrice + tax;


  return (
    <main className="min-h-screen bg-gray-50 py-10">

      <div className="max-w-7xl mx-auto px-6">


        {/* Header */}

        <div className="mb-10">

          <h1 className="text-4xl font-bold text-gray-900">
            Checkout
          </h1>

          <p className="text-gray-500 mt-2">
            Review your items and complete your purchase
          </p>

        </div>




        <div className="grid lg:grid-cols-3 gap-8">



          {/* LEFT SIDE */}

          <div className="lg:col-span-2 space-y-6">


            {/* Order Items */}

            <div className="bg-white rounded-3xl p-6 shadow-sm border">


              <h2 className="text-xl font-bold mb-6">
                Order Items ({cart.items.length})
              </h2>



              <div className="space-y-6">


                {cart.items.map((item) => (

                  <div
                    key={item.id}
                    className="flex gap-5 items-center"
                  >



                    {/* Product Image */}

                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-gray-100">


                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />


                    </div>





                    {/* Details */}

                    <div className="flex-1">


                      <h3 className="font-semibold text-lg">
                        {item.title}
                      </h3>


                      <p className="text-sm text-gray-500">
                        {item.store}
                      </p>



                      <div className="flex justify-between mt-5">


                        <span className="text-gray-600">
                          Qty: {item.quantity}
                        </span>


                        <span className="font-bold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>


                      </div>


                    </div>



                  </div>


                ))}



              </div>



            </div>







            {/* About Purchase */}

            <div className="bg-white rounded-3xl p-6 shadow-sm border">


              <h2 className="text-xl font-bold mb-4">
                About Your Purchase
              </h2>


              <p className="text-gray-600 leading-relaxed mb-5">

                When you complete checkout, you&apos;ll be redirected
                to each merchant&apos;s website to finalize your purchase
                securely.

              </p>



              <div className="space-y-3 text-gray-700">


                <div>
                  ✓ Secure payment through official stores
                </div>


                <div>
                  ✓ Merchant&apos;s return policy applies
                </div>


                <div>
                  ✓ Direct customer support from stores
                </div>


              </div>


            </div>






            {/* AI Try On */}

            <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">


              <h2 className="font-bold text-lg">
                AI Try-On Preview
              </h2>


              <p className="text-gray-600 mt-2">

                See how selected items look on your digital twin
                before purchasing.

              </p>



              <button
                className="
                mt-4
                px-5
                py-2
                bg-indigo-600
                text-white
                rounded-xl
                "
              >
                View Try-On
              </button>



            </div>




          </div>









          {/* RIGHT SIDE */}


          <div>


            <div className="bg-white rounded-3xl p-6 shadow-sm border sticky top-10">


              <h2 className="text-xl font-bold mb-6">
                Order Summary
              </h2>




              <div className="space-y-4 text-gray-600">


                <div className="flex justify-between">

                  <span>
                    Subtotal
                  </span>

                  <span>
                    ${totalPrice.toFixed(2)}
                  </span>

                </div>





                <div className="flex justify-between">

                  <span>
                    Shipping
                  </span>


                  <span className="text-green-600">
                    Free
                  </span>


                </div>





                <div className="flex justify-between">

                  <span>
                    Estimated Tax
                  </span>


                  <span>
                    ${tax.toFixed(2)}
                  </span>


                </div>



              </div>





              <hr className="my-6"/>





              <div className="flex justify-between text-xl font-bold">


                <span>
                  Total
                </span>


                <span>
                  ${total.toFixed(2)}
                </span>


              </div>






              <button
                className="
                mt-6
                w-full
                bg-indigo-600
                hover:bg-indigo-700
                text-white
                py-4
                rounded-2xl
                font-semibold
                "
              >

                Continue to Merchants

              </button>






              <div className="mt-6 space-y-3 text-sm text-gray-600">


                <p>
                  ✓ Secure checkout
                </p>


                <p>
                  ✓ 30-day return policy
                </p>


                <p>
                  ✓ Free shipping on all orders
                </p>


              </div>




            </div>



          </div>




        </div>


      </div>


    </main>
  );
}

"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";


interface UploadBoxProps {

  onUpload: (file: File) => void;

  preview?: string | null;

  onRemove?: () => void;

}



export default function UploadBox({
  onUpload,
  preview,
  onRemove,

}: UploadBoxProps) {


  const fileInputRef =
    useRef<HTMLInputElement>(null);


  const [error, setError] =
    useState<string | null>(null);



  const validateFile = (
    file: File
  ) => {


    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];



    if (!allowedTypes.includes(file.type)) {

      setError(
        "Only PNG and JPG images are supported"
      );

      return false;

    }




    if (file.size > 5 * 1024 * 1024) {

      setError(
        "Image size must be less than 5MB"
      );

      return false;

    }



    return true;

  };







  const handleFile = (
    file?: File
  ) => {


    if (!file) return;



    if (!validateFile(file)) {
      return;
    }



    setError(null);


    onUpload(file);

  };







  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {


    const file =
      e.target.files?.[0];


    handleFile(file);

  };








  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>
  ) => {


    e.preventDefault();


    const file =
      e.dataTransfer.files?.[0];


    handleFile(file);

  };






  return (

    <div>


      {
        preview ? (


          <div
            className="
              relative
              aspect-[4/5]
              rounded-2xl
              overflow-hidden
              bg-gray-100
            "
          >


            <img

              src={preview}

              alt="Preview"

              className="
                w-full
                h-full
                object-cover
              "

            />



            {
              onRemove && (

                <button

                  onClick={onRemove}

                  className="
                    absolute
                    top-3
                    right-3
                    bg-white
                    rounded-full
                    p-2
                    shadow
                  "

                >

                  <X size={18}/>

                </button>

              )
            }


          </div>


        ) : (



          <div

            onClick={() =>
              fileInputRef.current?.click()
            }


            onDragOver={(e) =>
              e.preventDefault()
            }


            onDrop={handleDrop}



            className="
              h-80
              border-2
              border-dashed
              border-indigo-300
              rounded-2xl
              flex
              flex-col
              items-center
              justify-center
              cursor-pointer
              hover:bg-indigo-50
              transition
            "

          >



            <Upload

              size={55}

              className="
                text-indigo-600
                mb-5
              "

            />



            <p className="
              font-semibold
              text-lg
              text-gray-800
            ">
              Drag & Drop
            </p>




            <p className="
              text-gray-500
              mt-1
            ">
              or Click to Upload
            </p>





            <p className="
              text-sm
              text-gray-400
              mt-3
            ">
              PNG / JPG
            </p>




            <p className="
              text-xs
              text-gray-400
            ">
              Max size 5MB
            </p>



          </div>


        )

      }





      {
        error && (

          <p className="
            text-red-500
            text-sm
            mt-3
          ">
            {error}
          </p>

        )
      }







      <input

        ref={fileInputRef}

        type="file"

        accept="image/png,image/jpeg"

        className="hidden"

        onChange={handleChange}

      />


    </div>

  );

}
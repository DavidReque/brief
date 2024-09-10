import MaxWithWrapper from "@/components/MaxWithWrapper";
import Navbar from "@/components/Navbar";
import { buttonVariants } from "@/components/ui/button";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { ArrowBigRight } from "lucide-react";

export default function Home() {
  // TODO: ocular botones de login y register si el usuario ya inicio sesion
  return (
    <>
      <Navbar />
      <MaxWithWrapper className="mb-12 mt-28 sm:mt-32 flex flex-col items-center justify-center text-center">
        <div
          className="mb-12 mt-28 sm:mt-32 flex flex-col items-center justify-center text-center'>
        <div className='mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50'>
          <p className='text-sm font-semibold text-gray-700"
        >
          <p className="text-sm font-semibold text-gray-700">Bienvenido</p>
        </div>
        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
          Empieza a guardar tus <span className="text-red-600">documentos</span>{" "}
          de manera segura.
        </h1>

        <RegisterLink
          className={buttonVariants({
            size: "lg",
            className: "mt-5",
          })}
          target="_blank"
        >
          Comencemos <ArrowBigRight className="ml-2 h-5 w-5" />
        </RegisterLink>
      </MaxWithWrapper>

      {/* value proposition section */}
      <div>
        <div className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-13rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-36rem)] sm:w-[72.1875rem]"
            />
          </div>
        </div>
      </div>
    </>
  );
}

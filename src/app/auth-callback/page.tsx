import dynamic from "next/dynamic";
import LoadingScreen from "@/components/LoadingScreen";

const AuthCallbackHandler = dynamic(
  () => import("@/components/AuthCallbackHandler"),
  { ssr: false }
);

const Page = () => {
  return (
    <>
      <LoadingScreen />
      <AuthCallbackHandler />
    </>
  );
};

export default Page;

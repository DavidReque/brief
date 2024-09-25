import AuthCallbackHandler from "@/components/AuthCallbackHandler";
import LoadingScreen from "@/components/LoadingScreen";

const Page = () => {
  return (
    <>
      <AuthCallbackHandler />
      <LoadingScreen />
    </>
  );
};

export default Page;

import Link from "next/link";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { AutoTypingResume } from "home/AutoTypingResume";

export const Hero = () => {
  return (
    <section className="lg:flex lg:h-[825px] lg:justify-center relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-60"></div>
      
      <FlexboxSpacer maxWidth={75} minWidth={0} className="hidden lg:block" />
      <div className="mx-auto max-w-xl pt-8 text-center lg:mx-0 lg:grow lg:pt-32 lg:text-left relative z-10">
        <div className="mb-4">
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-100 to-blue-100 px-4 py-2 text-sm font-medium text-purple-800 ring-1 ring-inset ring-purple-200">
            ✨ Free & Open Source
          </span>
        </div>
        
        <h1 className="text-primary pb-2 text-4xl font-bold lg:text-6xl leading-tight">
          Create a professional
          <br />
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            resume easily
          </span>
        </h1>
        
        <p className="mt-6 text-lg lg:mt-8 lg:text-xl text-gray-600 leading-relaxed">
          With this free, open-source, and powerful resume builder that helps you stand out in the competitive job market
        </p>
        
        <div className="mt-8 lg:mt-12 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <Link 
            href="/resume-import" 
            className="btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Create Resume <span aria-hidden="true">→</span>
          </Link>
        </div>
        
        <p className="ml-6 mt-4 text-sm text-gray-500">No sign up required • 100% free</p>
        
        <div className="mt-8 lg:mt-16 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600">
            Ready to create your professional resume? Start building now!
          </p>
        </div>
      </div>
      
      <FlexboxSpacer maxWidth={100} minWidth={50} className="hidden lg:block" />
      <div className="mt-6 flex justify-center lg:mt-4 lg:block lg:grow relative z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-200/20 to-blue-200/20 rounded-2xl blur-3xl"></div>
          <AutoTypingResume />
        </div>
      </div>
    </section>
  );
};

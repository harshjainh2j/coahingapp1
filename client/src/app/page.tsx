import Link from "next/link";
import { LogIn, ArrowRight, BookOpen, Award, GraduationCap, MapPin, Users, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-900/95 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-slate-900" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-white uppercase tracking-wider">Sagar Coaching</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-semibold text-slate-300">
            <Link href="#about" className="hover:text-amber-500 transition-colors">About Us</Link>
            <Link href="#faculty" className="hover:text-amber-500 transition-colors">Faculty</Link>
            <Link href="#campus" className="hover:text-amber-500 transition-colors">Campus</Link>
            <Link href="#admissions" className="hover:text-amber-500 transition-colors">Admissions</Link>
          </nav>
          <div className="flex items-center">
            <Link 
              href="/login" 
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-amber-500/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Portal Login</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="/images/sagar_hero.png" 
              alt="Sagar Coaching Premium Campus" 
              fill
              className="object-cover"
              priority
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-transparent"></div>
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-start">
            <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold text-amber-500 border border-amber-500/30 bg-amber-500/10 mb-6 backdrop-blur-sm">
              <MapPin className="w-4 h-4 mr-2" />
              The #1 Institute in Sagar, MP
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-3xl leading-[1.1]">
              Shaping the <span className="text-amber-500">brightest minds</span> of tomorrow.
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl font-light">
              Experience unparalleled academic excellence with our elite faculty, state-of-the-art smart classrooms, and proven track record of top-tier selections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="#admissions" className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-900 px-8 py-4 rounded-full text-base font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                Enroll Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#about" className="flex items-center justify-center bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 px-8 py-4 rounded-full text-base font-bold transition-all">
                Explore Campus
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <div className="bg-amber-500 py-10 relative z-20 -mt-8 mx-4 sm:mx-8 rounded-2xl shadow-2xl max-w-7xl xl:mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-900/10">
            <div>
              <div className="text-4xl font-extrabold text-slate-900 mb-1">5000+</div>
              <div className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Selections</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-slate-900 mb-1">15+</div>
              <div className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Years Legacy</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-slate-900 mb-1">50+</div>
              <div className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Expert Faculty</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-slate-900 mb-1">#1</div>
              <div className="text-sm font-semibold text-slate-800 uppercase tracking-wider">In MP Region</div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <section id="about" className="py-32 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
                  A legacy of <span className="text-slate-500">excellence.</span>
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  At Sagar Coaching, we don't just teach; we mentor. Our holistic approach to education combines rigorous academic training with modern technology, ensuring our students are prepared for the most competitive exams in the country.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">Elite Faculty Members</h4>
                      <p className="text-slate-600">Learn directly from educators who have produced top rankers year after year.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">Comprehensive Material</h4>
                      <p className="text-slate-600">Access our highly researched, updated, and exhaustive study materials.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">Personalized Mentorship</h4>
                      <p className="text-slate-600">One-on-one doubt solving and personalized performance analytics for every student.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campus Image Side */}
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500 rounded-3xl translate-x-4 translate-y-4"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white h-[600px]">
                  <Image 
                    src="/images/sagar_campus.png" 
                    alt="Students studying in Sagar Coaching modern campus" 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 pt-20 pb-10 text-slate-400 border-t-4 border-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="bg-amber-500 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-slate-900" />
              </div>
              <span className="font-bold text-2xl tracking-tight uppercase">Sagar Coaching</span>
            </div>
            <p className="text-slate-400 max-w-md mb-8 leading-relaxed">
              The most trusted and premium educational institute in Central India, dedicated to shaping futures and building careers.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Civil Lines, Sagar, Madhya Pradesh 470001</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-amber-500 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> About Institute</Link></li>
              <li><Link href="#" className="hover:text-amber-500 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Our Courses</Link></li>
              <li><Link href="#" className="hover:text-amber-500 transition-colors flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Past Results</Link></li>
              <li><Link href="/login" className="hover:text-amber-500 transition-colors flex items-center gap-2 text-amber-500"><ArrowRight className="w-3 h-3" /> Student Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 tracking-wider uppercase text-sm">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-amber-500 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="#" className="hover:text-amber-500 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-center text-sm">
          <p>© {new Date().getFullYear()} Sagar Coaching Institute. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

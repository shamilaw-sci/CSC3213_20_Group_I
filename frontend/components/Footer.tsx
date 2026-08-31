/** WBS-Shared | Owner: All members | Branch: reviewed integration branch | Scope: Shared application foundation. */
export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#32105f] to-[#2563eb] text-indigo-100 px-6 py-12">

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

        
        <div>
          <h2 className="text-2xl font-bold text-white">TryVora</h2>
          <p className="mt-4 text-sm">
            Experience the future of online shopping with AI-powered virtual try-ons and digital twin technology.
          </p>
        </div>

        
        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">About</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
            <li><a href="#" className="hover:text-white">Blog</a></li>
          </ul>
        </div>

        
        <div>
          <h3 className="text-white font-semibold mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Help Center</a></li>
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
          </ul>
        </div>

        
        <div>
          <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
          <p className="text-sm mb-4">
            Subscribe to get latest updates.
          </p>

          <div className="flex">
            <input
              type="email"
              placeholder="Enter email"
              className="w-full px-3 py-2 rounded-l-lg bg-gray-800 text-white outline-none"
            />
            <button className="px-4 py-2 bg-white text-indigo-800 rounded-r-lg font-semibold hover:bg-indigo-50">
              Subscribe
            </button>
          </div>
        </div>

      </div>

      {/* Bottom */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
        © 2026 TryVora. All rights reserved.
      </div>

    </footer>
  );
}

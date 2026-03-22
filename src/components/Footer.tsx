export default function Footer() {
  return (
    <footer className="border-t border-lab-200 bg-lab-50">
      <div className="section-wrapper py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-lab-900 mb-3">
              PlaceLab
            </h3>
            <p className="text-sm text-lab-500 leading-relaxed">
              Yonsei PlaceLab<br />
              장소와 사람을 연구합니다.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-lab-900 uppercase tracking-wider mb-3">
              Contact
            </h4>
            <div className="text-sm text-lab-500 space-y-1">
              <p>연세대학교</p>
              <p>placelab@yonsei.ac.kr</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-lab-900 uppercase tracking-wider mb-3">
              Follow
            </h4>
            <div className="flex gap-4 text-sm text-lab-500">
              <a
                href="https://instagram.com/placelab"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-lab-900 transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://scholar.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-lab-900 transition-colors"
              >
                Google Scholar
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-lab-200">
          <p className="text-xs text-lab-400">
            © {new Date().getFullYear()} PlaceLab. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

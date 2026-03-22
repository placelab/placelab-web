export default function Footer() {
  return (
    <footer className="border-t border-lab-200">
      <div className="section-wrapper py-4">
        <p className="text-xs text-lab-400">
          © {new Date().getFullYear()} 연세대학교 PlaceLab
        </p>
      </div>
    </footer>
  );
}

type Props = { completed: number; remaining: number; animate: boolean };

export default function Scoreboard({ completed, remaining, animate }: Props) {
  // Bəzi brauzerlərdə az-AZ tarix məlumatı yoxdur; ay və gün adlarını açıq saxlayırıq.
  const now = new Date();
  const days = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə'];
  const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
  const date = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
  const isoDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return (
    <section className="scoreboard" aria-label="Oyun tablosu">
      <div className="match-meta"><span>MATCHDAY</span><time dateTime={isoDate}>{date}</time></div>
      <div className={`score-display ${animate ? 'score-update' : ''}`} aria-hidden="true">
        <div><strong key={`goals-${completed}`}>{completed}</strong><span>QOL</span></div>
        <span className="score-divider">:</span>
        <div><strong key={`left-${remaining}`}>{remaining}</strong><span>QALAN</span></div>
      </div>
      <span className="visually-hidden" aria-live="polite" aria-atomic="true">
        {completed} qol, {remaining} tapşırıq qalıb
      </span>
    </section>
  );
}

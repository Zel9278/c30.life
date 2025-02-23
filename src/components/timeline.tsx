const timelineData = [
  {
    year: "2024/05/22",
    title: "mk.tty7.uk（至り来たり宿 第二期）を開設した",
  },
  {
    year: "2024/xx/xx",
    title: "名古屋から横浜へ移動",
  },
  {
    year: "2024/01/05",
    title: "m.tty7.uk (至り来たり宿)を開設した",
  },
  {
    year: "2023/10/29",
    title: "Misskey.art運営再開",
  },
  {
    year: "2023/07/09",
    title: "Misskey.artのリーダーを辞退、裏方へ移動",
  },
  {
    year: "2023/02/06",
    title: "Misskey.artを開設した",
  },
  {
    year: "2022/12/24",
    title: "Misskeyをしようを開設した",
  },
  {
    year: "2022/11/15",
    title: "Misskey.ioに登録した、色々な人と関わり始めた",
  },
  {
    year: "2017～",
    title: "BlackMIDI、黒楽譜を作り始める、動画投稿をし始める",
  },
  {
    year: "2016～2018",
    title: "MCPEのmodをすこし作る、Discordのbot(ZeriaBot)を作る",
  },
]

export default function timeline() {
  return (
    <>
      <ul className="timeline timeline-vertical">
        {timelineData.map(({ year, title }, i) => (
          <li key={year}>
            <hr />
            <div
              className={`timeline-${
                i % 2 === 0 ? "start" : "end"
              } timeline-box`}
            >
              <h5>{year}</h5>
              <h4>{title}</h4>
            </div>
            <hr className="bg-ptimary" />
          </li>
        ))}
      </ul>
    </>
  )
}

"use client";

import Link from "next/link";
import Image from "next/image";

const contacts = [
  {
    title: "X (旧Twitter)",
    href: "https://x.com/fuji_ced",
  },
  {
    title: "Discord",
    href: "https://discord.gg/X7RrHwV4US",
  },
  {
    title: "Mail",
    href: "mailto:ced@c30.life",
  },
  {
    title: "Misskey",
    href: "https://mk.c30.life/@c30",
  },
];

const socialLinks = [
  {
    title: "Misskey.art",
    href: "https://misskey.art/@c30",
  },
  {
    title: "Misskey.io",
    href: "https://misskey.io/@c30",
  },
  {
    title: "Bluesky",
    href: "https://bsky.app/profile/c30.life",
  },
  {
    title: "Github",
    href: "https://github.com/Zel9278",
  },
  {
    title: "Youtube(archive)",
    href: "https://www.youtube.com/@cedmidiark",
  },
  {
    title: "Niconico",
    href: "https://www.nicovideo.jp/user/40069987",
  },
  {
    title: "Pixiv",
    href: "https://www.pixiv.net/users/71067167",
  },
  {
    title: "Keyoxide",
    href: "https://keyoxide.org/5717936DE6707ABE284ADB9A4C10C121022E422D",
  },
  {
    title: "Keybase",
    href: "https://keybase.io/c30",
  },
  {
    title: "Skeb",
    href: "https://skeb.jp/@c30",
  },
];

const otherSites = [
  {
    title: "Old Homepage",
    href: "https://old.c30.life",
  },
  {
    title: "kusoda.net(クソだね)",
    href: "https://kusoda.net",
  },
  {
    title: "PC Status",
    href: "https://pc-stats.eov2.com",
  },
  {
    title: "PC Status (new)",
    href: "https://pc-status.net",
  },
  {
    title: "Progress Bar for Days Web",
    href: "https://pdays.eov2.com",
  },
  {
    title: "c30のふぁいるさあばあ",
    href: "https://f.c30.life",
  },
];

const myFediverseServers = [
  {
    title: "Misskey.art",
    href: "https://misskey.art",
    image:
      "https://raw.githubusercontent.com/Misskey-art/Assets/main/banner/200x40.png",
    alt: "Misskey.art",
  },
  {
    title: "至り来たり宿（第二期）",
    href: "https://mk.c30.life",
    image: "https://mk.c30.life/files/2d68d53f-1316-4953-86c7-92f88e566620",
    alt: "至り来たり宿（第二期）",
  },
];

const mutualLinks = [
  {
    title: "hi there (assault1892)",
    href: "https://assault1892.boats",
    image: "https://assault1892.boats/banner/assault1892.png",
    alt: "あさるとのホームページ",
  },
  {
    title: "fuck cloudflare (assault1892)",
    href: "https://assault1892.boats/fuck",
    image: "https://assault1892.boats/banner/fuckcloudflare.png",
    alt: "あさるとのホームページ",
  },
  {
    title: "kazukazu123123",
    href: "https://kazu123.net",
    image: "https://kazu123.net/banner.png",
    alt: "かずかずのホームページ",
  },
  {
    title: "デデオチャンのホームページ",
    href: "https://deryck2000.jp.eu.org/",
    image:
      "https://deryck2000.jp.eu.org/assets/banner/deryck_banner_200_40.png",
    alt: "デデオチャンのホームページ",
  },
  {
    title: "垂紡町",
    href: "https://suiboutown.tumblr.com/",
    image:
      "https://files.misskey.art//fd270cc0-02e3-49ad-9351-c247f5a466a5.png",
    alt: "さんめさんのホームページ",
  },
  {
    title: "Lamp",
    href: "https://lamp.wtf",
    image: null,
    alt: "ランプのホームページ",
  },
];

export default function Links() {
  return (
    <>
      <h1 className="text-[18px] text-[rgba(200,200,200,255)]">Contacts</h1>

      <div className="grid grid-cols-4 gap-2 text-center">
        {contacts.map((link, i) => {
          return (
            <Link
              key={link.title}
              className="link link-accent"
              href={link.href}
            >
              {link.title}
            </Link>
          );
        })}
      </div>

      <div className="bg-[#646464] w-full h-1 my-2 rounded" />
      <h1 className="text-[18px] text-[rgba(200,200,200,255)]">Socials</h1>

      <div className="grid grid-cols-4 gap-2 text-center">
        {socialLinks.map((link, i) => {
          return (
            <Link
              key={link.title}
              className="link link-accent"
              href={link.href}
            >
              {link.title}
            </Link>
          );
        })}
      </div>

      <div className="bg-[#646464] w-full h-1 my-2 rounded" />
      <h1 className="text-[18px] text-[rgba(200,200,200,255)]">Others</h1>

      <div className="grid grid-cols-4 gap-2 text-center">
        {otherSites.map((link, i) => {
          return (
            <Link
              key={link.title}
              className="link link-accent"
              href={link.href}
            >
              {link.title}
            </Link>
          );
        })}
      </div>

      <div className="bg-[#646464] w-full h-1 my-2 rounded" />
      <h1 className="text-[18px] text-[rgba(200,200,200,255)]">
        Reciprocal Link
      </h1>

      <div className="grid grid-cols-4 gap-2">
        {mutualLinks.map((link, i) => {
          return (
            <>
              <Link href={link.href}>
                {link.image ? (
                  <>
                    <Image
                      src={link.image}
                      alt={link.alt}
                      width={200}
                      height={36}
                    />
                  </>
                ) : (
                  <button type="button" className="btn btn-outline btn-info">
                    {link.title}
                  </button>
                )}
              </Link>
            </>
          );
        })}
      </div>

      <div className="bg-[#646464] w-full h-1 my-2 rounded" />
      <h1 className="text-[18px] text-[rgba(200,200,200,255)]">My Bannar</h1>

      <div className="grid grid-cols-2 gap-2">
        <Link href="https://c30.life" target="_blank" className="text-center">
          <Image
            src="/c30-life-banner.png"
            width="234"
            height="60"
            alt="ホームページ"
          />
        </Link>
        <Link href="https://c30.life" target="_blank" className="text-center">
          <Image
            src="/c30-life-banner-2.png"
            width="234"
            height="60"
            alt="ホームページ"
          />
        </Link>
      </div>
    </>
  );
}

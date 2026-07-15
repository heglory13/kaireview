"use client";

import Image from "next/image";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type FptBranchContact = {
  region: string;
  detail: string;
  email: string;
  phone: string;
  extension: string;
};

type FptBranchContactMapProps = {
  contacts: FptBranchContact[];
  regions: string[];
  locationPin: string;
};

const mapTileIds = [
  "49-27",
  "50-27",
  "51-27",
  "52-27",
  "49-28",
  "50-28",
  "51-28",
  "52-28",
  "49-29",
  "50-29",
  "51-29",
  "52-29",
  "49-30",
  "50-30",
  "51-30",
  "52-30",
];

function normalizeRegion(value: string) {
  return value
    .toLocaleLowerCase("vi-VN")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function displayBranchPhone(phone: string) {
  return phone.length === 9 ? `0${phone}` : phone;
}

export function FptBranchContactMap({ contacts, locationPin, regions }: FptBranchContactMapProps) {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [activeRegion, setActiveRegion] = useState(contacts[0]?.region ?? "");
  const [mapMode, setMapMode] = useState<"roadmap" | "satellite">("roadmap");
  const [zoom, setZoom] = useState(0);

  const selectedRegionKey = normalizeRegion(selectedRegion);
  const activeContact = useMemo(
    () => contacts.find((contact) => contact.region === activeRegion) ?? null,
    [activeRegion, contacts],
  );
  const filteredContacts = useMemo(() => {
    if (!selectedRegionKey) return contacts;
    return contacts.filter((contact) => normalizeRegion(contact.region) === selectedRegionKey);
  }, [contacts, selectedRegionKey]);
  const visibleMarkers = selectedRegionKey && filteredContacts.length > 0 ? filteredContacts : contacts;

  function chooseRegion(region: string) {
    setSelectedRegion(region);
    const nextContact = contacts.find((contact) => normalizeRegion(contact.region) === normalizeRegion(region));
    if (nextContact) {
      setActiveRegion(nextContact.region);
      setZoom((current) => Math.max(current, 1));
    } else {
      setActiveRegion("");
      setZoom(0);
    }
  }

  function chooseContact(contact: FptBranchContact) {
    setActiveRegion(contact.region);
  }

  return (
    <div className="fpt-branch-contact-layout">
      <aside className="fpt-branch-sidebar" aria-label="Danh sách liên hệ chi nhánh FPT Telecom">
        <label className="fpt-branch-select">
          <span>Khu vực</span>
          <select value={selectedRegion} onChange={(event) => chooseRegion(event.target.value)}>
            <option value="">Khu vực</option>
            {regions.map((region) => (
              <option value={region} key={region}>
                {region}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" size={16} />
        </label>

        <div className="fpt-branch-card-list">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => {
              const phone = displayBranchPhone(contact.phone);
              const isActive = contact.region === activeRegion;

              return (
                <button
                  className={cn("fpt-branch-office-card", isActive && "is-active")}
                  key={`${contact.region}-${contact.email}`}
                  onClick={() => chooseContact(contact)}
                  type="button"
                >
                  <span className="fpt-branch-office-head">
                    <Image src={locationPin} alt="" width={24} height={33} />
                    <strong>FPT TELECOM {contact.region}</strong>
                  </span>
                  <span className="fpt-branch-person">{contact.detail}</span>
                  <span className="fpt-branch-meta">
                    <span>
                      <b>Email:</b>
                      <i>{contact.email}</i>
                    </span>
                    <span>
                      <b>Phone:</b>
                      <i>{phone}</i>
                    </span>
                    <span>
                      <b>Hotline:</b>
                      <em>{contact.extension}</em>
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <p className="fpt-branch-empty">Chưa có dữ liệu liên hệ cho khu vực này.</p>
          )}
        </div>
      </aside>

      <div className={cn("fpt-branch-map", `mode-${mapMode}`)} aria-label="Bản đồ các chi nhánh FPT Telecom trên toàn quốc">
        <div className="fpt-map-type-control" aria-label="Chọn kiểu bản đồ">
          <button className={cn(mapMode === "roadmap" && "is-active")} onClick={() => setMapMode("roadmap")} type="button">
            Bản đồ
          </button>
          <button className={cn(mapMode === "satellite" && "is-active")} onClick={() => setMapMode("satellite")} type="button">
            Vệ tinh
          </button>
        </div>

        <div className="fpt-map-zoom-control" aria-label="Điều khiển thu phóng bản đồ">
          <button aria-label="Phóng to bản đồ" onClick={() => setZoom((current) => Math.min(current + 1, 2))} type="button">
            <Plus size={17} />
          </button>
          <button aria-label="Thu nhỏ bản đồ" onClick={() => setZoom((current) => Math.max(current - 1, 0))} type="button">
            <Minus size={17} />
          </button>
        </div>

        <div className="fpt-map-reset-control">
          <button
            onClick={() => {
              setSelectedRegion("");
              setActiveRegion(contacts[0]?.region ?? "");
              setZoom(0);
            }}
            type="button"
          >
            Toàn quốc
          </button>
        </div>

        <div className={cn("fpt-branch-map-stage", `zoom-${zoom}`)}>
          <div className="fpt-branch-map-base" aria-hidden="true">
            <div className="fpt-map-tile-grid">
              {mapTileIds.map((tileId) => (
                <span className={cn("fpt-map-tile", `tile-${tileId}`)} key={tileId} />
              ))}
            </div>
            <span className="fpt-map-place place-vietnam">Việt Nam</span>
            <span className="fpt-map-place place-laos">Lào</span>
            <span className="fpt-map-place place-cambodia">Campuchia</span>
            <span className="fpt-map-place place-thailand">Thái Lan</span>
            <span className="fpt-map-place place-china">Trung Quốc</span>
            <span className="fpt-map-place place-sea">Biển Đông</span>
          </div>
          <div className="fpt-branch-map-marker-layer" aria-label="Marker chi nhánh">
            {visibleMarkers.map((contact) => {
              const isActive = contact.region === activeContact?.region;

              return (
                <button
                  aria-label={`Xem liên hệ FPT Telecom ${contact.region}`}
                  className={cn(
                    "fpt-map-point",
                    `pos-${normalizeRegion(contact.region)}`,
                    isActive && "is-active",
                    selectedRegionKey && !isActive && "is-dimmed",
                  )}
                  key={`${contact.region}-${contact.email}`}
                  onClick={() => chooseContact(contact)}
                  type="button"
                >
                  <Image src={locationPin} alt="" width={30} height={41} />
                  <span>
                    <strong>FPT TELECOM {contact.region}</strong>
                    <small>{contact.email}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

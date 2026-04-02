'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader } from '@googlemaps/js-api-loader'
import {
  MapPin, Search, Filter, Star, Phone, Globe,
  ChevronRight, Loader2, Navigation,
} from 'lucide-react'

/* ───────── 型定義 ───────── */
type PlaceType = 'dog_run' | 'dog_cafe' | 'all'

interface Place {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
  rating: number | null
  userRatingsTotal: number
  type: PlaceType
  openNow: boolean | undefined
  website?: string
  phone?: string
}

/* ───────── ユーティリティ ───────── */
const TYPE_LABELS: Record<PlaceType | 'all', string> = {
  all: 'すべて',
  dog_run: 'ドッグラン',
  dog_cafe: 'ドッグカフェ',
}

const KEYWORDS: Record<PlaceType, string> = {
  dog_run: 'ドッグラン',
  dog_cafe: 'ドッグカフェ',
  all: '犬',
}

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return null
  return (
    <div className="flex items-center gap-1">
      <Star className="h-3 w-3" style={{ color: 'var(--color-gold-400)', fill: 'var(--color-gold-400)' }} />
      <span className="text-xs font-medium" style={{ color: 'var(--color-gold-300)' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

function PlaceCard({ place, selected, onClick }: { place: Place; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-4 transition-all"
      style={{
        background: selected ? 'color-mix(in srgb, var(--color-gold-400) 8%, transparent)' : 'var(--color-surface)',
        border: selected ? '1px solid var(--color-gold-600)' : '1px solid var(--color-border)',
      }}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <h3
          className="text-sm font-medium leading-tight"
          style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)', fontSize: '1rem' }}
        >
          {place.name}
        </h3>
        <ChevronRight className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-subtle)' }} />
      </div>

      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-xs"
          style={{
            background: place.type === 'dog_run'
              ? 'color-mix(in srgb, #4a8fa8 12%, transparent)'
              : 'color-mix(in srgb, var(--color-gold-400) 12%, transparent)',
            color: place.type === 'dog_run' ? '#7aafd4' : 'var(--color-gold-300)',
          }}
        >
          {TYPE_LABELS[place.type]}
        </span>
        {place.openNow !== undefined && (
          <span
            className="text-xs"
            style={{ color: place.openNow ? '#6da96d' : '#c0614a' }}
          >
            {place.openNow ? '営業中' : '閉店中'}
          </span>
        )}
        <StarRating rating={place.rating} />
      </div>

      <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-subtle)' }}>
        {place.address}
      </p>
    </button>
  )
}

/* ───────── メインコンポーネント ───────── */
export default function MapPageClient() {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])

  const [places, setPlaces] = useState<Place[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const [filterType, setFilterType] = useState<PlaceType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Google Maps 初期化
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey || !mapRef.current) return

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'marker'],
    })

    loader.load().then(() => {
      if (!mapRef.current) return

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 35.6812, lng: 139.7671 }, // 東京デフォルト
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
        mapId: 'inu-roots-map',
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#0d0b09' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#0d0b09' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#6b6054' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c1916' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#322e28' }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#070604' }] },
          { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0f1a0e' }] },
        ],
      })

      googleMapRef.current = map
      setMapReady(true)

      // 現在地取得
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(({ coords }) => {
          const loc = { lat: coords.latitude, lng: coords.longitude }
          setUserLocation(loc)
          map.setCenter(loc)
          searchNearby(map, loc, 'all')
        })
      }
    }).catch(() => {
      // APIキー未設定の場合はダミーモード
      setMapReady(true)
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 近隣スポット検索
  const searchNearby = useCallback(async (
    map: google.maps.Map,
    location: { lat: number; lng: number },
    type: PlaceType | 'all',
  ) => {
    setLoading(true)

    // 既存マーカーをクリア
    markersRef.current.forEach((m) => { m.map = null })
    markersRef.current = []

    const service = new google.maps.places.PlacesService(map)
    const results: Place[] = []

    const types = type === 'all' ? ['dog_run', 'dog_cafe'] as PlaceType[] : [type]

    await Promise.all(types.map((t) =>
      new Promise<void>((resolve) => {
        service.nearbySearch(
          {
            location,
            radius: 5000,
            keyword: KEYWORDS[t],
            type: 'establishment',
          },
          (res, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && res) {
              res.slice(0, 10).forEach((p) => {
                if (!p.place_id || !p.geometry?.location) return
                results.push({
                  placeId: p.place_id,
                  name: p.name ?? '不明',
                  address: p.vicinity ?? '',
                  lat: p.geometry.location.lat(),
                  lng: p.geometry.location.lng(),
                  rating: p.rating ?? null,
                  userRatingsTotal: p.user_ratings_total ?? 0,
                  type: t,
                  openNow: p.opening_hours?.isOpen(),
                })
              })
            }
            resolve()
          },
        )
      }),
    ))

    setPlaces(results)

    // マーカーを配置
    results.forEach((place) => {
      const el = document.createElement('div')
      el.style.cssText = `
        width: 32px; height: 32px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        background: ${place.type === 'dog_run' ? '#4a8fa8' : '#c47a2e'};
        border: 2px solid white; cursor: pointer; font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      `
      el.textContent = place.type === 'dog_run' ? '🐾' : '☕'

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: place.lat, lng: place.lng },
        map,
        content: el,
        title: place.name,
      })

      marker.addListener('click', () => {
        setSelectedPlace(place)
        map.panTo({ lat: place.lat, lng: place.lng })
      })

      markersRef.current.push(marker)
    })

    setLoading(false)
  }, [])

  const handleFilterChange = (type: PlaceType | 'all') => {
    setFilterType(type)
    if (googleMapRef.current && userLocation) {
      searchNearby(googleMapRef.current, userLocation, type)
    }
  }

  const moveToCurrentLocation = () => {
    if (navigator.geolocation && googleMapRef.current) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const loc = { lat: coords.latitude, lng: coords.longitude }
        setUserLocation(loc)
        googleMapRef.current!.setCenter(loc)
        googleMapRef.current!.setZoom(14)
        searchNearby(googleMapRef.current!, loc, filterType)
      })
    }
  }

  const filteredPlaces = places.filter((p) => {
    if (searchQuery) return p.name.includes(searchQuery) || p.address.includes(searchQuery)
    return true
  })

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col">
      {/* ページヘッダー */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="mb-1 text-xs uppercase tracking-widest" style={{ color: 'var(--color-gold-500)' }}>
            Spot Map
          </p>
          <h1
            className="text-2xl font-light"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)' }}
          >
            ドッグラン・カフェ
          </h1>
        </div>
        <button
          onClick={moveToCurrentLocation}
          className="btn-ghost flex items-center gap-2 text-xs"
        >
          <Navigation className="h-3.5 w-3.5" />
          現在地
        </button>
      </div>

      <div className="divider-gold mb-4" />

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* 左パネル：リスト */}
        <div className="flex w-72 flex-shrink-0 flex-col">
          {/* 検索 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="施設名・住所で検索"
              className="input-luxury pl-10 text-xs"
            />
          </div>

          {/* フィルター */}
          <div className="mb-3 flex gap-1.5">
            {(['all', 'dog_run', 'dog_cafe'] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleFilterChange(t)}
                className="flex-1 rounded-lg py-1.5 text-xs transition-all"
                style={{
                  background: filterType === t ? 'color-mix(in srgb, var(--color-gold-400) 12%, transparent)' : 'var(--color-surface)',
                  border: filterType === t ? '1px solid var(--color-gold-600)' : '1px solid var(--color-border)',
                  color: filterType === t ? 'var(--color-gold-300)' : 'var(--color-text-muted)',
                }}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>

          {/* リスト */}
          <div className="flex-1 space-y-2 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--color-gold-500)' }} />
              </div>
            )}
            {!loading && filteredPlaces.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <MapPin className="mb-2 h-8 w-8 opacity-20" style={{ color: 'var(--color-gold-400)' }} />
                <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                  {userLocation ? 'スポットが見つかりません' : '現在地を取得しています...'}
                </p>
              </div>
            )}
            <AnimatePresence>
              {filteredPlaces.map((place) => (
                <motion.div
                  key={place.placeId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <PlaceCard
                    place={place}
                    selected={selectedPlace?.placeId === place.placeId}
                    onClick={() => {
                      setSelectedPlace(place)
                      googleMapRef.current?.panTo({ lat: place.lat, lng: place.lng })
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* 右パネル：地図 */}
        <div className="relative flex-1 overflow-hidden rounded-xl" style={{ border: '1px solid var(--color-border)' }}>
          {/* 地図本体 */}
          <div ref={mapRef} className="h-full w-full" />

          {/* API キー未設定の場合のプレースホルダー */}
          {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: 'var(--color-surface)' }}
            >
              <MapPin className="mb-3 h-10 w-10 opacity-20" style={{ color: 'var(--color-gold-400)' }} />
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Google Maps API キーを設定してください
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                .env.local の NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
              </p>
            </div>
          )}

          {/* 選択施設の詳細 */}
          <AnimatePresence>
            {selectedPlace && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="absolute bottom-4 left-4 right-4 rounded-xl p-4"
                style={{
                  background: 'color-mix(in srgb, var(--color-surface) 95%, transparent)',
                  border: '1px solid var(--color-border)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <h3
                      className="font-medium"
                      style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--color-cream-100)', fontSize: '1.125rem' }}
                    >
                      {selectedPlace.name}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                      {selectedPlace.address}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPlace(null)}
                    className="text-xs"
                    style={{ color: 'var(--color-text-subtle)' }}
                  >
                    ✕
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <StarRating rating={selectedPlace.rating} />
                  {selectedPlace.rating && (
                    <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
                      ({selectedPlace.userRatingsTotal}件)
                    </span>
                  )}
                  {selectedPlace.phone && (
                    <a
                      href={`tel:${selectedPlace.phone}`}
                      className="flex items-center gap-1 text-xs transition-colors"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      <Phone className="h-3 w-3" />
                      {selectedPlace.phone}
                    </a>
                  )}
                  {selectedPlace.website && (
                    <a
                      href={selectedPlace.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs"
                      style={{ color: 'var(--color-gold-400)' }}
                    >
                      <Globe className="h-3 w-3" />
                      公式サイト
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

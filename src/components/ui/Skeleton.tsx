// components/ui/Skeleton.tsx - スケルトンUIコンポーネント
'use client'

import { useEffect, useState } from "react"

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: boolean
  animated?: boolean
}

export function Skeleton({ 
  className = '', 
  width, 
  height, 
  rounded = false,
  animated = true 
}: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  }

  return (
    <div
      className={`
        bg-gray-200 
        ${animated ? 'animate-pulse' : ''} 
        ${rounded ? 'rounded-full' : 'rounded'} 
        ${className}
      `}
      style={style}
    />
  )
}

// 🎯 商品カード用スケルトン
export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      {/* 画像部分 */}
      <Skeleton height="192" className="w-full" />
      
      {/* 商品名 */}
      <div className="space-y-2">
        <Skeleton height="16" className="w-full" />
        <Skeleton height="16" className="w-3/4" />
      </div>
      
      {/* 価格・評価 */}
      <div className="flex items-center justify-between">
        <Skeleton height="20" width="80" />
        <div className="flex items-center space-x-1">
          <Skeleton height="16" width="16" rounded />
          <Skeleton height="16" width="40" />
        </div>
      </div>
      
      {/* ショップ名 */}
      <Skeleton height="14" width="120" />
      
      {/* ボタン */}
      <div className="space-y-2">
        <Skeleton height="36" className="w-full" />
        <Skeleton height="36" className="w-full" />
      </div>
    </div>
  )
}

// 📋 リストアイテム用スケルトン
export function ProductListSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-start space-x-4">
        {/* 画像 */}
        <Skeleton width="80" height="80" />
        
        <div className="flex-1 space-y-3">
          {/* 商品名 */}
          <div className="space-y-2">
            <Skeleton height="18" className="w-full" />
            <Skeleton height="18" className="w-2/3" />
          </div>
          
          {/* 価格・詳細 */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton height="20" width="100" />
              <Skeleton height="14" width="150" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Skeleton height="32" width="80" />
              <Skeleton height="32" width="60" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 🔍 検索結果ヘッダー用スケルトン
export function ResultsHeaderSkeleton() {
  return (
    <div className="bg-white border-b p-6">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="space-y-3">
            <Skeleton height="32" width="300" />
            <div className="flex items-center space-x-4">
              <Skeleton height="16" width="100" />
              <Skeleton height="16" width="80" />
              <Skeleton height="16" width="120" />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Skeleton height="36" width="80" />
            <Skeleton height="36" width="100" />
            <Skeleton height="36" width="90" />
          </div>
        </div>
      </div>
    </div>
  )
}

// 🎯 段階的表示コンポーネント
interface ProgressiveLoadingProps {
  children: React.ReactNode
  skeleton: React.ReactNode
  isLoading: boolean
  delay?: number
}

export function ProgressiveLoading({ 
  children, 
  skeleton, 
  isLoading, 
  delay = 0 
}: ProgressiveLoadingProps) {
  const [showSkeleton, setShowSkeleton] = useState(true)

  

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowSkeleton(false)
      }, delay)
      
      return () => clearTimeout(timer)
    } else {
      setShowSkeleton(true)
    }
  }, [isLoading, delay])

  return (
    <div className="relative">
      {showSkeleton && (
        <div className={`transition-opacity duration-300 ${!isLoading ? 'opacity-0' : 'opacity-100'}`}>
          {skeleton}
        </div>
      )}
      
      {!showSkeleton && (
        <div className="transition-opacity duration-300 opacity-100">
          {children}
        </div>
      )}
    </div>
  )
}

// 🌟 検索結果全体のスケルトン表示
interface SearchResultsSkeletonProps {
  count?: number
  viewMode?: 'grid' | 'list'
}

export function SearchResultsSkeleton({ 
  count = 12, 
  viewMode = 'grid' 
}: SearchResultsSkeletonProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダースケルトン */}
      <ResultsHeaderSkeleton />
      
      {/* フィルタースケルトン */}
      <div className="bg-white border-b p-4">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton height="16" width="60" />
              <Skeleton height="32" width="100" />
              <Skeleton height="32" width="100" />
              <Skeleton height="32" width="120" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton height="32" width="60" />
              <Skeleton height="32" width="32" />
              <Skeleton height="32" width="32" />
            </div>
          </div>
        </div>
      </div>
      
      {/* コンテンツスケルトン */}
      <div className="container-custom py-8">
        {viewMode === 'grid' ? (
          <div className="grid-responsive">
            {Array.from({ length: count }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: count }, (_, i) => (
              <ProductListSkeleton key={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 🎨 カスタムスケルトンジェネレーター
export function createSkeletonPattern(pattern: Array<{
  width: string | number
  height: string | number
  className?: string
}>) {
  return (
    <div className="space-y-2">
      {pattern.map((item, index) => (
        <Skeleton
          key={index}
          width={item.width}
          height={item.height}
          className={item.className}
        />
      ))}
    </div>
  )
}

// 💫 アニメーション付きスケルトン
export function AnimatedSkeleton({ 
  children, 
  isLoading, 
  className = '' 
}: {
  children: React.ReactNode
  isLoading: boolean
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-white bg-opacity-90 flex items-center justify-center">
          <div className="space-y-4 w-full p-4">
            <Skeleton height="20" width="60%" />
            <Skeleton height="16" width="80%" />
            <Skeleton height="16" width="40%" />
          </div>
        </div>
      )}
      
      <div className={isLoading ? 'opacity-30' : 'opacity-100 transition-opacity duration-300'}>
        {children}
      </div>
    </div>
  )
}
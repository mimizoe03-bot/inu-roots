'use client'

import { useCallback, useEffect } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  NodeProps,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion } from 'framer-motion'
import { PawPrint } from 'lucide-react'
import type { Dog } from '@/lib/supabase/types'

/* ───────── 型定義 ───────── */
interface FamilyTreeDog extends Dog {
  sire?: FamilyTreeDog | null
  dam?: FamilyTreeDog | null
}

interface FamilyTreeProps {
  dog: FamilyTreeDog
  onNodeClick?: (dogId: string) => void
}

/* ───────── カスタムノードコンポーネント ───────── */
function DogNode({ data }: NodeProps) {
  const { name, breed, photoUrl, gender, isRoot } = data as {
    name: string
    breed: string
    photoUrl: string | null
    gender: 'male' | 'female' | null
    isRoot: boolean
  }

  const genderColor = gender === 'male' ? '#3b6ea0' : gender === 'female' ? '#a05b72' : '#6b6054'

  return (
    <>
      <Handle type="target" position={Position.Bottom} style={{ opacity: 0 }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
        style={{
          background: 'var(--color-surface)',
          border: `${isRoot ? '2px' : '1px'} solid ${isRoot ? 'var(--color-gold-500)' : genderColor + '60'}`,
          borderRadius: isRoot ? '12px' : '8px',
          padding: isRoot ? '12px' : '8px',
          minWidth: isRoot ? '140px' : '110px',
          boxShadow: isRoot ? '0 0 20px color-mix(in srgb, var(--color-gold-400) 15%, transparent)' : 'none',
        }}
      >
        {/* フォトアバター */}
        <div className="mb-2 flex justify-center">
          <div
            className="flex items-center justify-center overflow-hidden rounded-full"
            style={{
              width: isRoot ? '52px' : '36px',
              height: isRoot ? '52px' : '36px',
              background: 'var(--color-surface-2)',
              border: `1.5px solid ${genderColor}40`,
            }}
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <PawPrint
                style={{
                  width: isRoot ? '22px' : '16px',
                  height: isRoot ? '22px' : '16px',
                  color: 'var(--color-gold-700)',
                  opacity: 0.8,
                }}
              />
            )}
          </div>
        </div>

        {/* 名前 */}
        <p
          className="text-center font-medium leading-tight"
          style={{
            fontSize: isRoot ? '14px' : '11px',
            fontFamily: 'var(--font-cormorant)',
            color: isRoot ? 'var(--color-cream-100)' : 'var(--color-cream-300)',
          }}
        >
          {name}
        </p>

        {/* 犬種 */}
        <p
          className="mt-0.5 text-center leading-tight"
          style={{
            fontSize: isRoot ? '10px' : '9px',
            color: 'var(--color-text-subtle)',
          }}
        >
          {breed}
        </p>

        {isRoot && (
          <div
            className="mt-2 text-center"
            style={{
              fontSize: '9px',
              color: 'var(--color-gold-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            本犬
          </div>
        )}
      </motion.div>
      <Handle type="source" position={Position.Top} style={{ opacity: 0 }} />
    </>
  )
}

const nodeTypes = { dogNode: DogNode }

/* ───────── ノード・エッジ生成 ───────── */
function buildTree(dog: FamilyTreeDog): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  const LAYER_GAP = 160
  const HORIZONTAL_GAP = 180

  // 主役犬（中央下部）
  nodes.push({
    id: dog.id,
    type: 'dogNode',
    position: { x: 0, y: 0 },
    data: {
      name: dog.name,
      breed: dog.breed,
      photoUrl: dog.ai_portrait_url ?? dog.photo_url,
      gender: dog.gender,
      isRoot: true,
    },
  })

  // 親世代
  const parents: Array<{ dog: FamilyTreeDog; role: 'sire' | 'dam'; x: number }> = []

  if (dog.sire) {
    parents.push({ dog: dog.sire, role: 'sire', x: -HORIZONTAL_GAP })
  }
  if (dog.dam) {
    parents.push({ dog: dog.dam, role: 'dam', x: HORIZONTAL_GAP })
  }

  parents.forEach(({ dog: parent, role, x }) => {
    nodes.push({
      id: parent.id,
      type: 'dogNode',
      position: { x, y: -LAYER_GAP },
      data: {
        name: parent.name,
        breed: parent.breed,
        photoUrl: parent.ai_portrait_url ?? parent.photo_url,
        gender: parent.gender,
        isRoot: false,
      },
    })

    edges.push({
      id: `${dog.id}-${parent.id}`,
      source: parent.id,
      target: dog.id,
      style: {
        stroke: role === 'sire' ? '#3b6ea0' : '#a05b72',
        strokeWidth: 2,
        strokeDasharray: '5 3',
        opacity: 0.7,
      },
      animated: false,
    })

    // 祖父母世代
    const grandParents: Array<{ dog: FamilyTreeDog; role: 'sire' | 'dam'; dx: number }> = []
    if (parent.sire) grandParents.push({ dog: parent.sire, role: 'sire', dx: -HORIZONTAL_GAP * 0.75 })
    if (parent.dam) grandParents.push({ dog: parent.dam, role: 'dam', dx: HORIZONTAL_GAP * 0.75 })

    grandParents.forEach(({ dog: gp, role: gpRole, dx }) => {
      nodes.push({
        id: gp.id,
        type: 'dogNode',
        position: { x: x + dx, y: -LAYER_GAP * 2 },
        data: {
          name: gp.name,
          breed: gp.breed,
          photoUrl: gp.ai_portrait_url ?? gp.photo_url,
          gender: gp.gender,
          isRoot: false,
        },
      })

      edges.push({
        id: `${parent.id}-${gp.id}`,
        source: gp.id,
        target: parent.id,
        style: {
          stroke: gpRole === 'sire' ? '#3b6ea040' : '#a05b7240',
          strokeWidth: 1.5,
          strokeDasharray: '4 4',
          opacity: 0.5,
        },
      })
    })
  })

  return { nodes, edges }
}

/* ───────── メインコンポーネント ───────── */
export default function FamilyTree({ dog, onNodeClick }: FamilyTreeProps) {
  const { nodes: initNodes, edges: initEdges } = buildTree(dog)
  const [nodes, , onNodesChange] = useNodesState(initNodes)
  const [edges, , onEdgesChange] = useEdgesState(initEdges)

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.id !== dog.id && onNodeClick) {
        onNodeClick(node.id)
      }
    },
    [dog.id, onNodeClick],
  )

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{
        height: '500px',
        background: 'var(--color-background)',
        border: '1px solid var(--color-border)',
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="var(--color-border)"
          gap={24}
          size={1}
          style={{ opacity: 0.3 }}
        />
        <Controls
          showInteractive={false}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        />
      </ReactFlow>

      {/* 凡例 */}
      <div
        className="absolute bottom-4 left-4 flex gap-4 rounded-lg px-3 py-2"
        style={{ background: 'color-mix(in srgb, var(--color-surface) 90%, transparent)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-6 rounded" style={{ background: '#3b6ea0', opacity: 0.7 }} />
          <span style={{ fontSize: '10px', color: 'var(--color-text-subtle)' }}>父系</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-6 rounded" style={{ background: '#a05b72', opacity: 0.7 }} />
          <span style={{ fontSize: '10px', color: 'var(--color-text-subtle)' }}>母系</span>
        </div>
      </div>
    </div>
  )
}

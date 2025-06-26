"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useNodesState, useEdgesState, Node, Edge, ReactFlowInstance } from 'reactflow';
import { useQueryState } from 'nuqs';
import debounce from 'lodash.debounce';
import { migrateEdges } from '../lib/utils';

export function useDigitalTwinState(initialNodes: Node[] = [], initialEdges: Edge[] = []) {
  const [archParam, setArchParam] = useQueryState('arch', {
    defaultValue: '',
    shallow: false,
  });

  const [hydratedNodes, setHydratedNodes] = useState<Node[]>([]);
  const [hydratedEdges, setHydratedEdges] = useState<Edge[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState(hydratedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(hydratedEdges);

  const isUpdatingFromURL = useRef(false);

  useEffect(() => {
    const hydrateFromURL = async () => {
      if (!isHydrated) {
        if (archParam) {
          try {
            const padding = '='.repeat((4 - (archParam.length % 4)) % 4);
            const paddedBase64 = archParam.replace(/-/g, '+').replace(/_/g, '/') + padding;
            const jsonString = atob(paddedBase64);
            const canvasData = JSON.parse(jsonString);

            if (canvasData.nodes && canvasData.edges) {
              const migrated = migrateEdges(canvasData.edges);
              setHydratedNodes(canvasData.nodes);
              setHydratedEdges(migrated);
              isUpdatingFromURL.current = true;
              setNodes(canvasData.nodes);
              setEdges(migrated);
              setTimeout(() => { isUpdatingFromURL.current = false; }, 100);
            }
          } catch (error) {
            console.error('Failed to hydrate canvas state from URL:', error);
            const migratedInitial = migrateEdges(initialEdges);
            setHydratedNodes(initialNodes);
            setHydratedEdges(migratedInitial);
            setNodes(initialNodes);
            setEdges(migratedInitial);
          }
        } else {
          const migratedInitial = migrateEdges(initialEdges);
          setHydratedNodes(initialNodes);
          setHydratedEdges(migratedInitial);
          setNodes(initialNodes);
          setEdges(migratedInitial);
        }
        setIsHydrated(true);
      }
    };
    hydrateFromURL();
  }, [archParam, initialNodes, initialEdges, isHydrated, setNodes, setEdges]);

  const debouncedUpdateURL = useCallback(
    debounce((currentNodes: Node[], currentEdges: Edge[]) => {
      if (isUpdatingFromURL.current) return;
      try {
        const canvasData = { nodes: currentNodes, edges: currentEdges, timestamp: Date.now() };
        const jsonString = JSON.stringify(canvasData);
        if (jsonString.length > 50000) {
          console.warn('Canvas data too large for URL, skipping URL update');
          return;
        }
        const base64String = btoa(jsonString).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        setArchParam(base64String, { scroll: false, shallow: true });
      } catch (error) {
        console.error('Failed to update URL with canvas state:', error);
      }
    }, 1000),
    [setArchParam]
  );
  
  const forceURLUpdate = useRef(false);

  const handleNodesChange = useCallback((changes: any[]) => {
    onNodesChange(changes);
    const hasPositionChange = changes.some(change =>
      change.type === 'position' || change.type === 'dimensions'
    );
    if (hasPositionChange) {
      forceURLUpdate.current = true;
    }
  }, [onNodesChange]);

  useEffect(() => {
    if (isHydrated && !isUpdatingFromURL.current) {
      debouncedUpdateURL(nodes, edges);
       if (forceURLUpdate.current) {
        forceURLUpdate.current = false;
      }
    }
  }, [nodes, edges, isHydrated, debouncedUpdateURL]);

  useEffect(() => {
    return () => {
      debouncedUpdateURL.cancel();
    };
  }, [debouncedUpdateURL]);

  return {
    nodes,
    setNodes,
    edges,
    setEdges,
    onNodesChange: handleNodesChange,
    onEdgesChange,
    isHydrated,
  };
} 
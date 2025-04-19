"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface RiskData {
  id: string
  name: string
  category: string
  probability: number
  impact: number
  risk: number
}

const riskData: RiskData[] = [
  { id: "1", name: "Supplier A Failure", category: "Supplier", probability: 0.7, impact: 0.9, risk: 0.63 },
  { id: "2", name: "Port Strike", category: "Logistics", probability: 0.5, impact: 0.8, risk: 0.4 },
  { id: "3", name: "Natural Disaster", category: "External", probability: 0.3, impact: 0.9, risk: 0.27 },
  { id: "4", name: "Quality Issues", category: "Production", probability: 0.6, impact: 0.5, risk: 0.3 },
  { id: "5", name: "Demand Surge", category: "Market", probability: 0.4, impact: 0.6, risk: 0.24 },
  { id: "6", name: "Inventory Shortage", category: "Inventory", probability: 0.7, impact: 0.7, risk: 0.49 },
  { id: "7", name: "Transportation Delay", category: "Logistics", probability: 0.8, impact: 0.4, risk: 0.32 },
  { id: "8", name: "Regulatory Change", category: "External", probability: 0.3, impact: 0.7, risk: 0.21 },
  { id: "9", name: "Supplier B Bankruptcy", category: "Supplier", probability: 0.2, impact: 0.9, risk: 0.18 },
  { id: "10", name: "Labor Shortage", category: "Production", probability: 0.5, impact: 0.5, risk: 0.25 },
]

export function RiskHeatmap() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const margin = { top: 50, right: 50, bottom: 50, left: 50 }

    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, 1]) // Probability from 0 to 1
      .range([0, innerWidth])

    const yScale = d3
      .scaleLinear()
      .domain([0, 1]) // Impact from 0 to 1
      .range([innerHeight, 0])

    // Create the main group
    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`)

    // Add background grid for risk zones
    const riskZones = [
      { x: 0, y: 0, width: innerWidth * 0.33, height: innerHeight * 0.33, color: "#4ade80", label: "Low Risk" },
      { x: innerWidth * 0.33, y: 0, width: innerWidth * 0.33, height: innerHeight * 0.33, color: "#4ade80", label: "" },
      { x: innerWidth * 0.66, y: 0, width: innerWidth * 0.34, height: innerHeight * 0.33, color: "#fbbf24", label: "" },
      {
        x: 0,
        y: innerHeight * 0.33,
        width: innerWidth * 0.33,
        height: innerHeight * 0.33,
        color: "#4ade80",
        label: "",
      },
      {
        x: innerWidth * 0.33,
        y: innerHeight * 0.33,
        width: innerWidth * 0.33,
        height: innerHeight * 0.33,
        color: "#fbbf24",
        label: "Medium Risk",
      },
      {
        x: innerWidth * 0.66,
        y: innerHeight * 0.33,
        width: innerWidth * 0.34,
        height: innerHeight * 0.33,
        color: "#ef4444",
        label: "",
      },
      {
        x: 0,
        y: innerHeight * 0.66,
        width: innerWidth * 0.33,
        height: innerHeight * 0.34,
        color: "#fbbf24",
        label: "",
      },
      {
        x: innerWidth * 0.33,
        y: innerHeight * 0.66,
        width: innerWidth * 0.33,
        height: innerHeight * 0.34,
        color: "#ef4444",
        label: "",
      },
      {
        x: innerWidth * 0.66,
        y: innerHeight * 0.66,
        width: innerWidth * 0.34,
        height: innerHeight * 0.34,
        color: "#ef4444",
        label: "High Risk",
      },
    ]

    g.selectAll(".risk-zone")
      .data(riskZones)
      .enter()
      .append("rect")
      .attr("class", "risk-zone")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", (d) => d.width)
      .attr("height", (d) => d.height)
      .attr("fill", (d) => d.color)
      .attr("opacity", 0.2)

    // Add zone labels
    g.selectAll(".zone-label")
      .data(riskZones.filter((d) => d.label))
      .enter()
      .append("text")
      .attr("class", "zone-label")
      .attr("x", (d) => d.x + d.width / 2)
      .attr("y", (d) => d.y + d.height / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("fill", "#666")
      .text((d) => d.label)

    // Add x-axis
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickFormat((d) => `${d3.format(".0%")(d as number)}`),
      )

    // Add y-axis
    g.append("g").call(
      d3
        .axisLeft(yScale)
        .ticks(5)
        .tickFormat((d) => `${d3.format(".0%")(d as number)}`),
    )

    // Add axis labels
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 40)
      .attr("text-anchor", "middle")
      .text("Probability")

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -40)
      .attr("text-anchor", "middle")
      .text("Impact")

    // Add tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "absolute bg-background p-2 rounded shadow-md border text-sm z-50 pointer-events-none")
      .style("opacity", 0)
      .style("position", "absolute")

    // Add risk bubbles
    g.selectAll(".risk-bubble")
      .data(riskData)
      .enter()
      .append("circle")
      .attr("class", "risk-bubble")
      .attr("cx", (d) => xScale(d.probability))
      .attr("cy", (d) => yScale(d.impact))
      .attr("r", (d) => d.risk * 40 + 5) // Size based on risk score
      .attr("fill", (d) => {
        if (d.risk < 0.3) return "#4ade80"
        if (d.risk < 0.5) return "#fbbf24"
        return "#ef4444"
      })
      .attr("opacity", 0.7)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("cursor", "pointer")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("stroke-width", 2).attr("opacity", 1)

        tooltip
          .style("opacity", 1)
          .html(`
            <div class="font-medium">${d.name}</div>
            <div class="text-sm">Category: ${d.category}</div>
            <div class="text-sm">Probability: ${d.probability * 100}%</div>
            <div class="text-sm">Impact: ${d.impact * 100}%</div>
            <div class="text-sm">Risk Score: ${d.risk * 100}%</div>
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`)
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-width", 1).attr("opacity", 0.7)

        tooltip.style("opacity", 0)
      })

    // Add risk labels
    g.selectAll(".risk-label")
      .data(riskData)
      .enter()
      .append("text")
      .attr("class", "risk-label")
      .attr("x", (d) => xScale(d.probability))
      .attr("y", (d) => yScale(d.impact) - (d.risk * 40 + 10))
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .text((d) => (d.name.length > 15 ? d.name.substring(0, 15) + "..." : d.name))

    return () => {
      tooltip.remove()
    }
  }, [])

  return <svg ref={svgRef} className="w-full h-full" />
}

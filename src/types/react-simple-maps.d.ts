declare module 'react-simple-maps' {
  import { ComponentType, CSSProperties, SVGProps, MouseEventHandler } from 'react'

  interface ProjectionConfig {
    center?: [number, number]
    scale?: number
    rotate?: [number, number, number]
    parallels?: [number, number]
  }

  interface ComposableMapProps {
    projection?: string
    projectionConfig?: ProjectionConfig
    width?: number
    height?: number
    style?: CSSProperties
    children?: React.ReactNode
  }

  interface GeographiesProps {
    geography: string | object
    children: (props: { geographies: GeoObject[] }) => React.ReactNode
  }

  interface GeoObject {
    rsmKey: string
    id: string | number
    [key: string]: unknown
  }

  interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: GeoObject
    style?: {
      default?: CSSProperties
      hover?: CSSProperties
      pressed?: CSSProperties
    }
  }

  interface MarkerProps {
    coordinates: [number, number]
    children?: React.ReactNode
  }

  interface LineProps {
    from: [number, number]
    to: [number, number]
    stroke?: string
    strokeWidth?: number
    className?: string
    style?: CSSProperties
    onMouseEnter?: MouseEventHandler<SVGLineElement>
    onMouseLeave?: MouseEventHandler<SVGLineElement>
  }

  export const ComposableMap: ComponentType<ComposableMapProps>
  export const Geographies: ComponentType<GeographiesProps>
  export const Geography: ComponentType<GeographyProps>
  export const Marker: ComponentType<MarkerProps>
  export const Line: ComponentType<LineProps>
}

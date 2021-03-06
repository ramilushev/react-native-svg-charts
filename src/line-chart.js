import * as array from 'd3-array'
import * as scale from 'd3-scale'
import * as shape from 'd3-shape'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import { View } from 'react-native'
import Svg, { Defs } from 'react-native-svg'
import Path from './animated-path'
import Grid from './grid'

class LineChart extends PureComponent {

    state = {
        width: 0,
        height: 0,
    }

    _onLayout(event) {
        const { nativeEvent: { layout: { height, width } } } = event
        this.setState({ height, width })
    }

    _createLine(dataPoints, yAccessor, xAccessor) {
        const { curve } = this.props

        return shape.line()
            .x(xAccessor)
            .y(yAccessor)
            .defined(value => typeof value === 'number')
            .curve(curve)
            (dataPoints)
    }

    render() {

        const {
                  dataPoints,
                  dataPointsX,
                  style,
                  animate,
                  animationDuration,
                  showGrid,
                  numberOfTicks,
                  contentInset: {
                      top    = 0,
                      bottom = 0,
                      left   = 0,
                      right  = 0,
                  },
                  gridMax,
                  gridMin,
                  renderDecorator,
                  extras,
                  renderExtra,
                  shadowOffset,
                  gridProps,
                  svg,
                  shadowSvg,
                  renderGradient,
                  renderGrid = Grid,
              } = this.props

        const { width, height } = this.state

        if (dataPoints.length === 0) {
            return <View style={ style }/>
        }

        const extent = array.extent([ ...dataPoints, gridMax, gridMin ])
        const ticks  = array.ticks(extent[ 0 ], extent[ 1 ], numberOfTicks)

        //invert range to support svg coordinate system
        const y = scale.scaleLinear()
            .domain(extent)
            .range([ height - bottom, top ])

        let x;

        if (dataPointsX) {
          x = scale.scaleLinear()
            .domain(array.extent(dataPointsX))
            .range([left, width - right])
        } else {
          x = scale.scaleLinear()
            .domain([ 0, dataPoints.length - 1 ])
            .range([ left, width - right ])
        }

        // const x = scale.scaleLinear()
        //     .domain([ 0, dataPoints.length - 1 ])
        //     .range([ left, width - right ])

        let line;
        let shadow;

        if (dataPointsX) {
          line = this._createLine(
            dataPoints,
            value => y(value),
            (value, index) => x(dataPointsX[index])
          )

          // console.log(line)

          shadow = this._createLine(
            dataPoints,
            value => y(value - shadowOffset),
            (value, index) => x(dataPointsX[index])
          )
        } else {
          line = this._createLine(
              dataPoints,
              value => y(value),
              (value, index) => x(index),
          )

          shadow = this._createLine(
              dataPoints,
              value => y(value - shadowOffset),
              (value, index) => x(index),
          )
        }


        return (
            <View style={style}>
                <View style={{ flex: 1 }} onLayout={event => this._onLayout(event)}>
                    <Svg style={{ flex: 1 }}>
                        { showGrid && renderGrid({ x, y, ticks, dataPoints, gridProps }) }
                        {
                            <Defs>
                                { renderGradient && renderGradient({ id: 'gradient', width, height, x, y }) }
                            </Defs>
                        }
                        <Path
                            { ...svg }
                            d={line}
                            stroke={renderGradient ? 'url(#gradient)' : svg.stroke}
                            fill={ 'none' }
                            animate={animate}
                            animationDuration={animationDuration}
                        />
                        <Path
                            strokeWidth={ 5 }
                            { ...shadowSvg }
                            d={shadow}
                            fill={'none'}
                            animate={animate}
                            animationDuration={animationDuration}
                        />
                        { dataPoints.map((value, index) => renderDecorator({ x, y, value, index })) }
                        { extras.map((item, index) => renderExtra({ x, y, item, index, width, height })) }
                    </Svg>
                </View>
            </View>
        )
    }
}

LineChart.propTypes = {
    dataPoints: PropTypes.arrayOf(PropTypes.number).isRequired,
    svg: PropTypes.object,
    shadowSvg: PropTypes.object,
    shadowOffset: PropTypes.number,

    style: PropTypes.any,

    animate: PropTypes.bool,
    animationDuration: PropTypes.number,

    curve: PropTypes.func,
    contentInset: PropTypes.shape({
        top: PropTypes.number,
        left: PropTypes.number,
        right: PropTypes.number,
        bottom: PropTypes.number,
    }),
    numberOfTicks: PropTypes.number,
    extras: PropTypes.array,

    renderDecorator: PropTypes.func,
    renderExtra: PropTypes.func,
    renderGradient: PropTypes.func,

    gridMin: PropTypes.number,
    gridMax: PropTypes.number,
    showGrid: PropTypes.bool,
    gridProps: PropTypes.object,
    renderGrid: PropTypes.func,
}

LineChart.defaultProps = {
    svg: {},
    shadowSvg: {},
    shadowOffset: 3,
    width: 100,
    height: 100,
    curve: shape.curveCardinal,
    contentInset: {},
    numberOfTicks: 10,
    showGrid: true,
    extras: [],
    renderDecorator: () => {
    },
    renderExtra: () => {
    },
}

export default LineChart

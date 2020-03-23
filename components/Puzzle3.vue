<template>
  <div class="puzzleContainer__gridContent">
    <div ref="puzzleContent" class="puzzleContent">
      <div class="puzzleContent__network puzzleContent__flexibleArea network">
        <div ref="networkGrid" class="network__grid">
          <!-- NETWORKS -->
          <!-- Tracks -->
          <div class="network__polylines network__polylines--tracks">
            <div id="tracksNetwork"></div>
          </div>
          <!-- Breaks -->
          <div class="network__polylines network__polylines--breaks">
            <div id="breaksNetwork"></div>
          </div>
          <!-- Tension -->
          <div class="network__polylines network__polylines--tension">
            <div id="tensionNetwork"></div>
          </div>

          <!-- BREAKS -->
          <div
            v-for="(lineBreak, index) in breaksCoords"
            :key="index"
            :class="lineBreak[0]"
            :style="`top: ${lineBreak[1]}px; left:${lineBreak[2]}px;`"
            class="network__breaks"
          ></div>

          <!-- NODES -->
          <div
            v-for="(node, index) in 18"
            :key="`${node}+${index}`"
            :class="[
              `node${setNodeId(index)}`,
              { input: setNodeId(index) === '21' },
              { output: nodesOutputId.includes(setNodeId(index)) }
            ]"
            class="network__node"
          >
            <!-- INPUT -->
            <div v-if="setNodeId(index) === '21'">
              <span class="input-text">
                <span ref="input1" class="single">{{ input[0] }}</span>
                <span ref="input2" class="single">{{ input[1] }}</span>
                <span ref="input3" class="single">{{ input[2] }}</span>
              </span>
              <Puzzle3ArrowOutput
                :node-id="setNodeId(index)"
                class="arrow arrowRight"
              />
            </div>
            <!-- OUTPUTS -->
            <div v-if="nodesOutputId.includes(setNodeId(index))">
              <span
                :ref="`output${setNodeId(index)}`"
                :class="`output${setNodeId(index)}`"
                class="output-text"
              >
                <span class="single">
                  {{
                    getOutputsNodeData(setNodeId(index)).output.substring(0, 2)
                  }}</span
                >
                <span class="single">
                  {{
                    getOutputsNodeData(setNodeId(index)).output.substring(2, 4)
                  }}</span
                >
                <span class="single">
                  {{
                    getOutputsNodeData(setNodeId(index)).output.substring(4, 6)
                  }}</span
                >
              </span>
              <Puzzle3ArrowOutput
                :node-id="setNodeId(index)"
                :class="[
                  { arrowLeft: ['11', '31'].includes(setNodeId(index)) },
                  { arrowRight: ['16', '26', '36'].includes(setNodeId(index)) }
                ]"
                class="arrow"
              />
            </div>

            <!-- SWITCHERS -->
            <div
              v-if="switchersPositions.includes(setNodeId(index))"
              class="network__switcher"
              @click="setNodePosition(setNodeId(index))"
            >
              <Puzzle3Arrow class="network__arrow" />
            </div>
          </div>
        </div>
      </div>
      <!-- BIG LIFE ICON -->
      <BaseBigLifeIcon ref="bigLifeIcon" />
    </div>
    <!-- ACTIONS -->
    <PuzzleActions
      :cols-num="1"
      :ctas="['valid']"
      :disable="disableValid"
      @validPuzzle="validPuzzle()"
    />
    <!-- Sounds -->
    <BaseSounds ref="puzzleError" sound-source="valid_error" />
    <BaseSounds ref="puzzleSuccess" sound-source="valid_success" />
    <BaseSounds ref="btnBasePuzzle" sound-source="btn_base_puzzle" />
  </div>
</template>
<script>
import Vue from 'vue'
import { TimelineMax, TweenMax } from 'gsap'
import { Expo } from 'gsap/EasePack'
import SVG from 'svg.js'
import PuzzleActions from '@/components/PuzzleActions.vue'
import {
  getRandomIntInclusive,
  getAllCombinationsSums,
  shuffleArray,
  killTimeOuts
} from '@/utils'
import Puzzle3Arrow from '@/components/Puzzle3Arrow'
import Puzzle3ArrowOutput from '@/components/Puzzle3ArrowOutput'
import BaseBigLifeIcon from '@/components/BaseBigLifeIcon'
import { EventBus } from '@/bus'
import { validPuzzle, shakePuzzle } from '@/mixins/validPuzzle.js'

export default {
  name: 'Puzzle3',
  components: {
    BaseBigLifeIcon,
    PuzzleActions,
    Puzzle3Arrow,
    Puzzle3ArrowOutput
  },
  mixins: [validPuzzle, shakePuzzle],
  data() {
    return {
      disableValid: true,
      preventClick: false,
      timeOuts: [],
      tweens: {
        switcherArrow: {}
      },
      networkGrid: '',
      input: '',
      nodes: [],
      nodesOutputs: [
        { id: '11', output: '000000' },
        { id: '16', output: '000000' },
        { id: '26', output: '000000' },
        { id: '31', output: '000000' },
        { id: '36', output: '000000' }
      ],
      nodesOutputId: ['11', '16', '26', '31', '36'],
      nodeRotationMatrix: {
        top: 0,
        right: 90,
        bottom: 180,
        left: 270
      },
      nodeFacingArrow: {
        left: 'right',
        right: 'left',
        bottom: 'top',
        top: 'bottom'
      },
      outputs: [],
      outputValid: '',
      switchersPositions: [
        '12',
        '13',
        '14',
        '15',
        '22',
        '23',
        '24',
        '25',
        '32',
        '33',
        '34',
        '35'
      ],
      draw: {},
      polyline: {},
      currentLine: [],
      breaksCoords: {
        break1: ['h', '24', '198'],
        break2: ['v', '56', '295'],
        break3: ['h', '89', '263'],
        break4: ['v', '121', '165'],
        break5: ['v', '121', '360'],
        break6: ['h', '154', '263']
      }
    }
  },
  mounted() {
    /* ==============================================================
                        Generate outputs values 
    ================================================================ */
    const generateOutputsValues = () => {
      const outputsTemp = []

      // Set outputsDummy
      for (let i = 0; i < 4; i++) {
        outputsTemp.push(getRandomIntInclusive(100000, 999999).toString())
      }
      // Set outputValid
      for (let index = 0; index < 3; index++) {
        // Set input single numbers
        const getRandomInteger = getRandomIntInclusive(1, 9)
        this.input += getRandomInteger
        // Set a random sum combination of two numbers matching getRandomInteger
        const matchingSum = () => {
          return new Promise((resolve, reject) => {
            resolve(
              getAllCombinationsSums(getRandomInteger)
                .filter(v => {
                  return v.length === 2
                })
                .sort(() => Math.random() - 0.5)[0]
                .sort(() => Math.random() - 0.5)
            )
          })
        }
        // Store matching sum in outputValid on resolve
        matchingSum().then(v => {
          this.outputValid += v.join('')
          if (index === 2) {
            // loop has ended
            outputsTemp.push(this.outputValid)
            // Store shuffled outputs
            this.outputs = shuffleArray(outputsTemp)

            this.outputs.forEach((v, i) => {
              this.nodesOutputs[i].output = v
            })
          }
        })
      }
    }
    generateOutputsValues()

    /* ==============================================================
                          Generate nodes data
================================================================ */
    const generateNodesData = () => {
      // Node constructor
      class NodeConstructor {
        constructor(
          id,
          currentPosition,
          coordinates,
          disabledDirections,
          output
        ) {
          this.id = id
          this.currentPosition = currentPosition
          this.endPoint = false
          this.coordinates = coordinates
          this.disabledDirections = disabledDirections
          this.output = output
        }
      }

      // Build nodes datas
      for (let i = 0; i < 18; i++) {
        const setNodeId = this.setNodeId(i)
        const node = this.$refs.networkGrid.querySelector(`.node${setNodeId}`)
        const coordinates = this.getNodeCoordinates(node, setNodeId)
        const arrowDirections = ['top', 'right', 'bottom', 'left']
        let currentPosition
        let disabledDirections
        let output

        // Specific uses-cases
        switch (setNodeId) {
          case '11':
            // is output
            output = this.outputs[0]
            currentPosition = 'none'
            disabledDirections = ['none']
            break
          case '12':
            disabledDirections = ['right']
            currentPosition = 'bottom'
            break
          case '13':
            disabledDirections = ['left']
            currentPosition = shuffleArray(arrowDirections)[0]
            break
          case '14':
            disabledDirections = ['bottom']
            currentPosition = shuffleArray(arrowDirections)[0]
            break
          case '16':
            // is output
            output = this.outputs[1]
            currentPosition = 'none'
            disabledDirections = ['none']
            break
          case '21':
            // is input
            currentPosition = shuffleArray(arrowDirections)[0]
            output = this.outputs[1]
            disabledDirections = ['none']
            break
          case '22':
            // is initial switcher
            disabledDirections = ['bottom', 'left']
            currentPosition = 'left'
            break
          case '23':
            disabledDirections = ['right']
            currentPosition = shuffleArray(arrowDirections)[0]
            break
          case '24':
            disabledDirections = ['top', 'left']
            currentPosition = shuffleArray(arrowDirections)[0]
            break
          case '25':
            disabledDirections = ['bottom']
            currentPosition = shuffleArray(arrowDirections)[0]
            break
          case '26':
            // is output
            output = this.outputs[2]
            currentPosition = 'none'
            disabledDirections = ['none']
            break
          case '31':
            // is output
            output = this.outputs[3]
            disabledDirections = ['none']
            currentPosition = 'none'
            break
          case '32':
            disabledDirections = ['top']
            currentPosition = shuffleArray(arrowDirections)[0]
            break
          case '33':
            disabledDirections = ['right']
            currentPosition = shuffleArray(arrowDirections)[0]
            break
          case '34':
            disabledDirections = ['left']
            currentPosition = shuffleArray(arrowDirections)[0]
            break
          case '35':
            disabledDirections = ['top']
            currentPosition = shuffleArray(arrowDirections)[0]
            break
          case '36':
            // is output
            output = this.outputs[4]
            currentPosition = 'none'
            disabledDirections = ['none']
            break
          default:
            disabledDirections = ['none']
            currentPosition = shuffleArray(arrowDirections)[0]
            output = 'none'
            break
        }

        const nodeConstructor = new NodeConstructor(
          setNodeId,
          currentPosition,
          coordinates,
          disabledDirections,
          output
        )
        this.nodes.push(nodeConstructor)
        if (i === 18 - 1) {
          // Synchronize nodes data
          this.synchronizeNodesData()
        }
      }
    }

    generateNodesData()

    /* ==============================================================
                            Generate networks
      ================================================================ */
    // Set network element
    // const networkGrid = this.$refs.networkGrid
    this.networkGrid = this.$refs.networkGrid

    this.timeOuts.push(
      setTimeout(() => {
        // Tension network
        this.setTensionNetwork('22', 'init')
        // Breaks network
        this.setBreaksNetwork()
        // Tracks network
        this.setTracksNetwork()
      }, 500)
    )

    /* ==============================================================
                            Show hint
    ================================================================ */

    // Helper dev -> immediatly trigger showHint (with delay to avoid asynchronous errors)
    // setTimeout(() => {
    //   this.showHint()
    // }, 500)

    EventBus.$on('showHint', () => {
      // Trigger showHint with slight delay
      this.timeOuts.push(
        setTimeout(() => {
          this.showHint()
        }, 500)
      )
    })
  },
  beforeDestroy() {
    EventBus.$off('showHint')
    killTimeOuts(this.timeOuts)
  },
  methods: {
    setNodeId(index) {
      return (
        (Math.round(Math.floor(index / 6)) + 1).toString() +
        ((index % 6) + 1).toString()
      )
    },
    setNodePosition(nodeId) {
      // Enable valid btn
      this.disableValid = false

      // Security unfreeze
      this.timeOuts = []

      // Triggers
      if (!this.preventClick) {
        // Btn sound
        this.$refs.btnBasePuzzle.playSound()
        // Triggers
        this.setArrowRotation(nodeId)
        this.updateNodeDirection(nodeId)
        this.setTensionNetwork(nodeId, 'evalNewStatus')
        this.preventClick = true
        console.warn('preventClick -> true')
      }
    },
    synchronizeNodesData() {
      // synchronize all switchers arrow rotations
      this.switchersPositions.forEach(id => {
        this.setArrowRotation(id, 'init')
      })
    },
    setArrowRotation(nodeId, context = 'setNewPosition') {
      // Freeze action
      EventBus.$emit('crtPreventBubbling', true)
      // Unfreeze action callback
      const unfreezeAction = () => {
        this.tweens.switcherArrow.kill()
        EventBus.$emit('crtPreventBubbling', false)
      }

      // Arrow rotation animation
      const nodeTween = nodeRotationValue => {
        this.tweens.switcherArrow = TweenMax.to(nodeArrow, 0.3, {
          rotation: nodeRotationValue,
          ease: Expo.easeOut,
          onComplete: unfreezeAction
        })
      }

      // Set node arrow element >
      const nodeArrow = this.$refs.networkGrid.querySelector(
        `.node${nodeId} .network__arrow`
      )

      if (context === 'init') {
        // INIT : set initial node rotation based on currentPosition
        // Find matching node data
        const node = this.nodes.find(v => {
          return v.id === nodeId
        })

        // Find matching rotation
        const nodeRotationValue = this.nodeRotationMatrix[node.currentPosition]

        // Tween
        nodeTween(nodeRotationValue)
      } else {
        // SET NEW POSITION : set +90° rotation on click
        // Tween
        nodeTween('+=90')
      }
    },
    getNodeData(nodeId) {
      return this.nodes.find(v => {
        return v.id === nodeId
      })
    },
    getOutputsNodeData(nodeId) {
      return this.nodesOutputs.find(v => {
        return v.id === nodeId
      })
    },
    getNodeCoordinates(nodeElement, nodeId) {
      let nodeX = nodeElement.offsetLeft + nodeElement.clientWidth / 2
      const nodeY = nodeElement.offsetTop + nodeElement.clientHeight / 2
      // Output uses cases
      const leftOutputs = ['11', '21', '31']
      const rightOutputs = ['16', '26', '36']
      if (leftOutputs.includes(nodeId)) {
        nodeX += 45
      }
      if (rightOutputs.includes(nodeId)) {
        nodeX -= 45
      }

      return [nodeX, nodeY]
    },
    updateNodeDirection(nodeId) {
      // Get node currentPosition
      const nodeCurrentPosition = this.getNodeData(nodeId).currentPosition

      // Get nodePosition array
      const nodePositions = Object.keys(this.nodeRotationMatrix)

      // Get index of matching current position in node Positions
      const currentPositionindexInNodePositions = nodePositions.indexOf(
        nodeCurrentPosition
      )

      // Update node position data to next position
      if (currentPositionindexInNodePositions === nodePositions.length - 1) {
        // back to [0]
        Vue.set(this.getNodeData(nodeId), 'currentPosition', nodePositions[0])
      } else {
        // go to next position
        Vue.set(
          this.getNodeData(nodeId),
          'currentPosition',
          nodePositions[currentPositionindexInNodePositions + 1]
        )
      }
    },
    getSiblingNodeId(nodeId) {
      const nodeCurrentPosition = this.getNodeData(nodeId).currentPosition
      const nodeRow = nodeId[0]
      const nodeCol = nodeId[1]
      const nodeSiblingId = []

      switch (nodeCurrentPosition) {
        case 'top':
          nodeSiblingId.push(parseInt(nodeRow) - 1)
          nodeSiblingId.push(nodeCol)
          break
        case 'right':
          nodeSiblingId.push(nodeRow)
          nodeSiblingId.push(parseInt(nodeCol) + 1)
          break
        case 'bottom':
          nodeSiblingId.push(parseInt(nodeRow) + 1)
          nodeSiblingId.push(nodeCol)
          break
        case 'left':
          nodeSiblingId.push(nodeRow)
          nodeSiblingId.push(parseInt(nodeCol) - 1)
          break
      }

      return nodeSiblingId.join('')
    },
    setTensionNetwork(nodeId, context) {
      // Set startNode
      const startNode = this.networkGrid.querySelector('.node21')

      // Set current node element
      const currentNode = this.networkGrid.querySelector(`.node${nodeId}`)

      /// METHODS

      // Update endpoint
      const updateEndPoint = nodeId => {
        // Reset all endpoints to false
        this.nodes.map(v => {
          return (v.endPoint = false)
        })
        // Set current node as current endPoint
        this.getNodeData(nodeId).endPoint = true
      }

      // Draw tension
      const initTension = node => {
        // Get nodes coordinates
        const startNodeXY = this.getNodeCoordinates(startNode, '21')
        const currentNodeXY = this.getNodeCoordinates(node)

        // Draw -> init
        this.timeOuts.push(
          setTimeout(() => {
            // Line container
            const draw = SVG('tensionNetwork').size(
              this.networkGrid.clientWidth,
              this.networkGrid.clientHeight
            )
            // Store draw
            this.draw = draw
            // Draw polyline
            const polyline = draw.polyline([startNodeXY, currentNodeXY])
            polyline.fill('none')
            polyline.stroke({
              color: '#9EC421',
              width: 6,
              linecap: 'round',
              linejoin: 'round'
            })
            // Store polyline
            this.polyline = polyline
            // Store currentLine coordinates
            this.currentLine = [startNodeXY, currentNodeXY]
          }, 500)
        )
      }

      const updateTension = (currentNode, siblingNode, siblingNodeId) => {
        if (siblingNode) {
          // Get next valid sibling coordinates

          const siblingNodeXY = this.getNodeCoordinates(
            siblingNode,
            siblingNodeId
          )

          // AFTER DRAWN:

          // Recall whole logic
          const recallWithSibling = () => {
            this.setTensionNetwork(siblingNodeId, 'evalNewStatus')
          }
          // Update line data
          const updateCurrentLine = () => {
            this.currentLine.push(siblingNodeXY)
          }

          // Draw -> update
          this.timeOuts.push(
            this.timeOuts.push(
              setTimeout(() => {
                const startNode = this.networkGrid.querySelector('.node21')
                const startNodeXY = this.getNodeCoordinates(startNode)
                this.polyline.clear()
                this.polyline.plot([startNodeXY])

                this.timeOuts.push(
                  setTimeout(() => {
                    this.polyline.plot([...this.currentLine])
                  }, 50)
                )
                this.timeOuts.push(
                  setTimeout(() => {
                    this.polyline
                      .animate(2, '<>')
                      .plot([...this.currentLine, siblingNodeXY])
                    this.timeOuts.push(
                      setTimeout(() => {
                        updateCurrentLine()
                        recallWithSibling()
                      }, 60)
                    )
                  }, 100)
                )
              }, 0)
            )
          )
        } else {
          this.timeOuts.push(
            setTimeout(() => {
              this.polyline.plot([...this.currentLine])
            }, 100)
          )
        }

        // Check if endPoint is an output to disable arrow animation
        const ouputsNodesAsEndpoint = this.nodes
          .filter(v => this.nodesOutputId.includes(v.id))
          .find(value => {
            return value.endPoint === true
          })
        if (!ouputsNodesAsEndpoint) {
          EventBus.$emit('stopOutputAnimation')
        }
      }

      const setLineToNextSibling = () => {
        // Vars
        const isEndPoint = this.getNodeData(nodeId).endPoint === true
        const nodeCurrentPosition = this.getNodeData(nodeId).currentPosition
        const isNodeOutput = this.nodesOutputId.includes(
          this.getNodeData(nodeId).id
        )
        const hasNodeDisabledDirection = this.getNodeData(
          nodeId
        ).disabledDirections.includes(nodeCurrentPosition)
        const allNodesId = Object.entries(this.nodes).map(v => v[1].id)

        if (isNodeOutput) {
          // Bail if node is an output
          this.timeOuts.push(
            setTimeout(() => {
              EventBus.$emit('crtPreventBubbling', false)
              this.preventClick = false
              console.log('preventClick -> false (node is output)')
            }, 500)
          )
          EventBus.$emit('endPointAtOutput', nodeId)
        } else if (hasNodeDisabledDirection) {
          this.timeOuts.push(
            setTimeout(() => {
              EventBus.$emit('crtPreventBubbling', false)
              this.preventClick = false
              console.log('preventClick -> false (node disabled direction)')
            }, 500)
          )

          // has a disabled direction
          if (!isEndPoint) {
            // Set endpoint to current node
            updateEndPoint(this.getNodeData(nodeId).id)
            // Draw new segment
            updateTension()
          }
        } else if (allNodesId.includes(this.getSiblingNodeId(nodeId))) {
          // Draw new segment
          updateTension()

          // Use case 1: Sibling exists
          const currentNodePosition = this.getNodeData(nodeId).currentPosition
          const siblingNodeId = this.getSiblingNodeId(nodeId)
          const siblingNode = this.networkGrid.querySelector(
            `.node${siblingNodeId}`
          )
          const siblingNodePosition = this.getNodeData(siblingNodeId)
            .currentPosition

          if (
            this.nodeFacingArrow[currentNodePosition] === siblingNodePosition
          ) {
            // Sibling has a facing arrow:

            // Test if sibling is already in currentLine
            const stringle = arr => {
              return arr.join(' |-| ')
            }
            const currentLineSearch = this.currentLine.map(row => {
              return stringle(row)
            })

            // Get sibling node coordinates
            const siblingNodeXY = this.getNodeCoordinates(siblingNode)

            const indexOfSiblingNodeXY = currentLineSearch.indexOf(
              stringle(siblingNodeXY)
            )

            if (indexOfSiblingNodeXY !== -1) {
              // Sibling is in current line : do nothing

              this.timeOuts.push(
                setTimeout(() => {
                  EventBus.$emit('crtPreventBubbling', false)
                  this.preventClick = false

                  console.log(
                    'preventClick -> false (sibling not in current line)'
                  )
                }, 500)
              )
            } else {
              // Continue to update tension

              // Set endpoint to siblingNode
              updateEndPoint(this.getSiblingNodeId(nodeId))
              // Draw new segment
              updateTension(currentNode, siblingNode, siblingNodeId)
            }
          } else {
            // Continue to update tension

            // Set endpoint to siblingNode
            updateEndPoint(this.getSiblingNodeId(nodeId))
            // Draw new segment
            updateTension(currentNode, siblingNode, siblingNodeId)
          }

          // todo: test if sibling is not in a disabled direction
        } else {
          // Use case 2: Sibling doesn't exists

          this.timeOuts.push(
            setTimeout(() => {
              EventBus.$emit('crtPreventBubbling', false)
              this.preventClick = false
              console.log('preventClick -> false (sibling doesnt exists')
            }, 500)
          )

          // // Set endpoint to siblingNode

          updateEndPoint(this.getNodeData(nodeId).id)
          // Draw new segment
          updateTension()
        }
        // }
      }

      /// SETS

      switch (context) {
        case 'init':
          // Set endpoint to node 22
          updateEndPoint(nodeId)
          // Draw initial line between node 21 and 22
          initTension(currentNode)
          break
        case 'evalNewStatus':
          // Is current node endPoint ?
          if (this.getNodeData(nodeId).endPoint === true) {
            // Node is endPoint

            setLineToNextSibling()
          } else {
            // Node is not endPoint

            // Get current node coordinates
            const currentNodeXY = this.getNodeCoordinates(currentNode)

            // Test if Node is in currentLine
            const stringle = arr => {
              return arr.join(' |-| ')
            }
            const currentLineSearch = this.currentLine.map(row => {
              return stringle(row)
            })

            const indexOfCurrentNodeXY = currentLineSearch.indexOf(
              stringle(currentNodeXY)
            )

            if (indexOfCurrentNodeXY !== -1) {
              // CurrentNodeXY is in currentLine

              // Splice currentLine values after index
              this.currentLine.splice(indexOfCurrentNodeXY + 1)
              setLineToNextSibling()
            } else {
              // Isolate node: do nothing

              this.timeOuts.push(
                setTimeout(() => {
                  EventBus.$emit('crtPreventBubbling', false)
                  this.preventClick = false
                  console.log('preventClick -> false (isolate node)')
                }, 500)
              )
            }
          }
          break
      }
    },
    setTracksNetwork() {
      // Draw tension
      const drawTracks = () => {
        this.timeOuts.push(
          setTimeout(() => {
            // Line container
            const draw = SVG('tracksNetwork').size(
              this.networkGrid.clientWidth,
              this.networkGrid.clientHeight
            )

            // Rows + cols coordinates
            const tracksCoordinates = {
              row1: [
                this.getNodeData('11').coordinates,
                this.getNodeData('16').coordinates
              ],
              row2: [
                this.getNodeData('21').coordinates,
                this.getNodeData('26').coordinates
              ],
              row3: [
                this.getNodeData('31').coordinates,
                this.getNodeData('36').coordinates
              ],
              switchersCol1: [
                this.getNodeData('12').coordinates,
                this.getNodeData('32').coordinates
              ],
              switchersCol2: [
                this.getNodeData('13').coordinates,
                this.getNodeData('33').coordinates
              ],
              switchersCol3: [
                this.getNodeData('14').coordinates,
                this.getNodeData('34').coordinates
              ],
              switchersCol4: [
                this.getNodeData('15').coordinates,
                this.getNodeData('35').coordinates
              ]
            }

            // Draw tracks
            for (const key of Object.keys(tracksCoordinates)) {
              draw
                .line([tracksCoordinates[key][0], tracksCoordinates[key][1]])
                .stroke({
                  color: '#859CA2',
                  opacity: 0.5,
                  width: 6,
                  linecap: 'round',
                  linejoin: 'round'
                })
            }
          }, 500)
        )
      }
      drawTracks()
    },
    setBreaksNetwork() {
      // Draw tension
      const drawTracks = () => {
        this.timeOuts.push(
          setTimeout(() => {
            // Line container
            const draw = SVG('breaksNetwork').size(
              this.networkGrid.clientWidth,
              this.networkGrid.clientHeight
            )

            // Rows + cols coordinates
            const breaksCoordinates = {
              break1: [
                this.getNodeData('12').coordinates,
                this.getNodeData('13').coordinates
              ],
              break2: [
                this.getNodeData('22').coordinates,
                this.getNodeData('32').coordinates
              ],
              break3: [
                this.getNodeData('23').coordinates,
                this.getNodeData('24').coordinates
              ],
              break4: [
                this.getNodeData('33').coordinates,
                this.getNodeData('34').coordinates
              ],
              break5: [
                this.getNodeData('14').coordinates,
                this.getNodeData('24').coordinates
              ],
              break6: [
                this.getNodeData('25').coordinates,
                this.getNodeData('35').coordinates
              ]
            }

            // Draw breaks
            for (const key of Object.keys(breaksCoordinates)) {
              draw
                .line([breaksCoordinates[key][0], breaksCoordinates[key][1]])
                .stroke({
                  color: '#DA112A',
                  width: 6,
                  linecap: 'round',
                  linejoin: 'round'
                })
            }
          }, 500)
        )
      }
      drawTracks()
    },
    checkPuzzle() {
      // Get endPoint id
      const endPointId = Object.entries(this.nodes).find(
        v => v[1].endPoint === true
      )[1].id

      const regex = / /gi
      // Get endpoint innerText
      const endpointOutput = this.$refs.networkGrid
        .querySelector(`.node${endPointId}`)
        .textContent.replace(regex, '')

      return endpointOutput === this.outputValid
    },
    showHint() {
      // Complete event
      const showHintComplete = () => {
        this.timeOuts.push(
          setTimeout(() => {
            EventBus.$emit('hideShowHintIndicator')
            EventBus.$emit('crtPreventBubbling', false)
            EventBus.$emit('puzzleGameOver')
          }, 500)
        )
      }
      // Get input elements
      const { input1 } = this.$refs
      // Get output elements
      const validOutputNode = this.nodesOutputs.find(
        v => v.output === this.outputValid
      )
      const validOutputNodeId = Object.values(validOutputNode)
      const validOutputParent = this.$refs[`output${validOutputNodeId[0]}`]
      const output1 = validOutputParent[0].querySelector('.single:nth-child(1)')

      // const { sum1d, sum2d, terms1, terms2 } = this.$refs

      // GSAP highlight sequence
      const timelineHint = new TimelineMax({
        repeat: 3,
        onComplete: showHintComplete
      })

      // Order elements to animate
      const elementsToAnimate = [output1, input1[0]]

      // Timeline
      elementsToAnimate.forEach(v => {
        timelineHint.to(v, 0.4, {
          transform: 'scale(1.5)',
          zIndex: 3000,
          color: '#ffffff',
          ease: Expo.easeInOut
        })
        timelineHint.to(v, 0.3, {
          transform: 'scale(1)',
          zIndex: 0,
          color: '#FFA81E',
          ease: Expo.easeInOut
        })
      })
    }
  }
}
/* eslint-enable no-unused-vars */
</script>

<style lang="scss" scoped>
@include puzzleContainerGridContent;

// Puzzle content
.puzzleContent {
  @include puzzleContentBaseProperties;
  &__flexibleArea {
    @include responsive(tablet) {
      transform: scale(1.75);
    }
  }
  .network {
    &__example {
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 15px;

      span {
        color: $color-golden;
        position: relative;
        &:not(.singleNum) {
          display: inline-flex;
          padding-left: 10px;
        }
      }
    }
    &__breaks {
      background-color: $color-anthracite;
      position: absolute;
      &.h {
        transform: skew(-20deg);
        width: 4px;
        height: 7px;
      }
      &.v {
        transform: skew(37deg) rotate(100deg);
        width: 4px;
        height: 9px;
      }
    }
    &__grid {
      position: relative;
      display: grid;
      width: 530px;
      align-content: center;
      justify-content: center;
      grid-template-columns: 1fr repeat(4, 55px) 1fr;
      grid-template-rows: repeat(3, 55px);
      gap: 10px;
    }
    &__node {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5px;
      position: relative;
      &.output,
      &.input {
        div {
          position: relative;
        }
        .output-text {
          padding: 16px;
          span {
            &.single {
              margin: -2px;
            }
          }
        }
        .input-text {
          color: $color-golden;
          padding: 10px;
          position: relative;
          top: 0px;
          margin-right: 11px;
          span.single {
            margin: -5px;
          }
        }
        span {
          color: $color-golden;
          padding: 10px;
          position: relative;
          top: 0px;
          &.single {
            padding: 0;

            display: inline-block;
          }
        }
        .arrow {
          position: absolute;
          width: 26px;
          top: -6px;
          @media screen and (min-width: 600px) {
            top: -5px;
          }

          &.arrowLeft {
            right: -18px;
            transform: rotate(-90deg);
          }
          &.arrowRight {
            left: -18px;
            transform: rotate(90deg);
          }
        }
      }

      &.input {
        span {
          color: $color-golden;
          font-size: 35px;
          padding: 10px;
        }
        .arrow {
          &.arrowRight {
            right: -14px;
            left: auto;
            top: 5px;
            transform: rotate(90deg);
          }
        }
      }
    }
    &__switcher {
      position: absolute;
      background-color: white;
      width: 90%;
      height: 90%;
      border-radius: 10px;
      border: 2px solid black;
      padding: 4px;
    }
    &__polylines {
      position: absolute;
      pointer-events: none;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
    }
  }
}
</style>

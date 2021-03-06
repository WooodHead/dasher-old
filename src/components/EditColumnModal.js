import React from 'react'
import { bool, func, number, object, shape, string } from 'prop-types'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import Modal from 'react-modal'

import { BOARD_QUERY } from './BoardPage'

class EditColumnModal extends React.Component {
  static propTypes = {
    columnId: string, // required when editing an existing column
    boardId: string, // required when creating a new column
    index: number, // required when creating a new column
    columnQuery: shape({
      loading: bool.isRequired,
      column: object,
    }),
    updateColumn: func.isRequired,
    createColumn: func.isRequired,
    hideModal: func.isRequired,
  }

  static defaultProps = {
    columnId: null,
    boardId: null,
    index: null,
    columnQuery: null,
  }

  state = { name: '', index: '', query: '' }

  componentDidMount() {
    const { columnId, columnQuery, index } = this.props

    if (columnId && !columnQuery.loading) {
      this.initializeFormState(columnQuery.column)
    }

    if (index !== null) {
      this.setState({ index })
    }
  }

  componentDidUpdate(prevProps) {
    const { columnId, columnQuery } = this.props

    if (columnId && prevProps.columnQuery.loading && !columnQuery.loading) {
      this.initializeFormState(columnQuery.column)
    }
  }

  initializeFormState = ({ name, index, query }) => {
    this.setState({ name, index, query })
  }

  handleNameChange = event => {
    this.setState({ name: event.target.value })
  }

  handleIndexChange = event => {
    this.setState({ index: event.target.value })
  }

  handleQueryChange = event => {
    this.setState({ query: event.target.value })
  }

  handleSubmit = event => {
    const {
      columnId,
      boardId,
      updateColumn,
      createColumn,
      hideModal,
    } = this.props
    const { name, index, query } = this.state

    event.preventDefault()
    hideModal()

    if (columnId) {
      updateColumn(columnId, name, index, query)
    } else {
      createColumn(boardId, name, index, query)
    }
  }

  render() {
    const { columnId, columnQuery, hideModal } = this.props
    const { name, index, query } = this.state

    return (
      <Modal isOpen onRequestClose={hideModal}>
        <div>
          <h1>{columnId ? 'Edit column' : 'Add column'}</h1>
          <form id="edit-column" onSubmit={this.handleSubmit}>
            <label>
              Name
              <div>
                <input
                  value={name}
                  onChange={this.handleNameChange}
                  disabled={columnQuery && columnQuery.loading}
                  required
                />
              </div>
            </label>
            <label>
              Index
              <div>
                <input
                  value={index}
                  type="number"
                  onChange={this.handleIndexChange}
                  disabled={columnQuery && columnQuery.loading}
                  required
                />
              </div>
            </label>
            <label>
              Query
              <div>
                <input
                  value={query}
                  onChange={this.handleQueryChange}
                  disabled={columnQuery && columnQuery.loading}
                  required
                />
              </div>
            </label>
          </form>
          <button onClick={hideModal}>Cancel</button>
          <button
            type="submit"
            form="edit-column"
            disabled={columnQuery && columnQuery.loading}
          >
            {columnId ? 'Save' : 'Create'}
          </button>
        </div>
      </Modal>
    )
  }
}

const COLUMN_QUERY = gql`
  query Column($id: ID!) {
    column: Column(id: $id) {
      id
      name
      index
      query
    }
  }
`

const UPDATE_COLUMN_MUTATION = gql`
  mutation UpdateColumn(
    $id: ID!
    $name: String!
    $index: Int!
    $query: String!
  ) {
    updateColumn(id: $id, name: $name, index: $index, query: $query) {
      id
      name
      index
      query
    }
  }
`

const CREATE_COLUMN_MUTATION = gql`
  mutation CreateColumn(
    $boardId: ID!
    $name: String!
    $index: Int!
    $query: String!
  ) {
    createColumn(boardId: $boardId, name: $name, index: $index, query: $query) {
      id
      name
      index
      query
    }
  }
`

export default compose(
  graphql(COLUMN_QUERY, {
    name: 'columnQuery',
    options: ({ columnId }) => ({ variables: { id: columnId } }),
    skip: ({ columnId }) => !columnId,
  }),
  graphql(UPDATE_COLUMN_MUTATION, {
    name: 'updateColumnMutation',
    props: ({ updateColumnMutation }) => ({
      updateColumn: (columnId, name, index, query) =>
        updateColumnMutation({
          variables: { id: columnId, name, index: parseInt(index, 10), query },
        }),
    }),
  }),
  graphql(CREATE_COLUMN_MUTATION, {
    name: 'createColumnMutation',
    props: ({ createColumnMutation }) => ({
      createColumn: (boardId, name, index, query) =>
        createColumnMutation({
          variables: { boardId, name, index: parseInt(index, 10), query },
          update: (store, { data: { createColumn } }) => {
            const data = store.readQuery({
              query: BOARD_QUERY,
              variables: { id: boardId },
            })
            data.board.columns.push(createColumn)
            store.writeQuery({
              query: BOARD_QUERY,
              variables: { id: boardId },
              data,
            })
          },
        }),
    }),
  }),
)(EditColumnModal)

/// <reference types="cypress" />
import React from 'react'
import { mount } from 'cypress-react-unit-test'

import "../App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import FileUpload from './FileUpload'

describe('FileUpload', () => {
  it('uploads a file', () => {
    // when the component mounts, it requests the list of files
    // from the server right away
    const files = [{
      url: '/file1',
      name: 'test1'
    }, {
      url: '/file2',
      name: 'test2'
    }]
    cy.server()
    cy.route('/files', files)

    mount(
      <div className="container" style={{ width: "600px" }}>
        <FileUpload />
      </div>
      , {
      alias: 'FileUpload'
      })

    // shows files returned by /files stub
    cy.get('.list-group-item').should('have.length', 2)

    // let's upload a file
    // first set it in the component using event property
    const testFile = new File(['data to upload'], 'upload.txt')
    cy.get('input[type=file]').trigger('change', { testFiles: [testFile] })
    // prepare mock server for uploading a file
    cy.route('POST', '/upload', []).as('upload')
    // and change the list of files to return all files
    // note that we create new array using concatenation for the stub
    cy.route('/files', files.concat({
      url: '/uploaded',
      name: 'uploaded'
    }))
    // let's go!
    cy.contains('button', 'Upload').click()

    // confirm the upload went through
    cy.wait('@upload')
    cy.get('.list-group-item').should('have.length', 3)
  })
})

// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * This application demonstrates how to perform basic operations on prediction
 * with the Google AutoML Translation API.
 *
 * For more information, see the documentation at
 * https://cloud.google.com/translate/automl/docs
 */

`use strict`;

async function predict(
  projectId,
  computeRegion,
  modelId,
  filePath,
  translationAllowFallback
) {
  // [START automl_translation_predict]
  const automl = require('@google-cloud/automl');
  const fs = require('fs');

  // Create client for prediction service.
  const client = new automl.PredictionServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const modelId = `id of the model, e.g. “ICN12345”`;
  // const filePath = `local text file path of content to be classified, e.g. "./resources/test.txt"`;
  // const translationAllowFallback = `use Google translation model as fallback, e.g. "False" or "True"`;

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // Read the file content for translation.
  const content = fs.readFileSync(filePath, 'utf8');

  // Set the payload by giving the content of the file.
  const payload = {
    textSnippet: {
      content: content,
    },
  };

  // Params is additional domain-specific parameters.
  // TranslationAllowFallback allows to use Google translation model.
  let params = {};
  if (translationAllowFallback) {
    params = {
      translationAllowFallback: true,
    };
  }

  const responses = await client.predict({
    name: modelFullId,
    payload: payload,
    params: params,
  });

  const response = responses[0];
  console.log(
    'Translated Content: ',
    response.payload[0].translation.translatedContent.content
  );

  // [END automl_translation_predict]
}

require('yargs')
  .demand(1)
  .options({
    computeRegion: {
      alias: 'c',
      type: 'string',
      default: 'us-central1',
      requiresArg: true,
      description: 'region name e.g. "us-central1"',
    },
    filePath: {
      alias: 'f',
      default: './resources/testInput.txt',
      type: 'string',
      requiresArg: true,
      description: 'local text file path of the content to be classified',
    },
    modelId: {
      alias: 'i',
      type: 'string',
      requiresArg: true,
      description: 'Id of the model which will be used for text classification',
    },
    projectId: {
      alias: 'z',
      type: 'number',
      default: process.env.GCLOUD_PROJECT,
      requiresArg: true,
      description: 'The GCLOUD_PROJECT string, e.g. "my-gcloud-project"',
    },
    translationAllowFallback: {
      alias: 't',
      type: 'string',
      default: 'False',
      requiresArg: true,
      description:
        'Use true if AutoML will fallback to use a Google translation model for' +
        'translation requests if the specified AutoML translation model cannot' +
        'serve the request. Use false to not use Google translation model.',
    },
  })
  .command('predict', 'classify the content', {}, opts =>
    predict(
      opts.projectId,
      opts.computeRegion,
      opts.modelId,
      opts.filePath,
      opts.translationAllowFallback
    )
  )
  .example(
    'node $0 predict -i "modelId" -f "./resources/testInput.txt" -t "False"'
  )
  .wrap(120)
  .recommendCommands()
  .help()
  .strict().argv;

<template>
  <div class="container">
    <a-menu
      mode="horizontal"
      theme="dark"
      v-model:selectedKeys="selectedKeys"
      @click="clickMenu"
    >
      <h2 class="title">Magic Watermark</h2>
      <a-menu-item key="embed">
        Embed
      </a-menu-item>
      <a-menu-item key="extract">
        Extract
      </a-menu-item>
    </a-menu>
    <div class="main">
      <a-input v-if="page === 'embed'" v-model:value="watermarkText" placeholder="Basic usage" class="input" />
      <a-upload-dragger
        accept="image/*"
        class="upload"
        name="file"
        :multiple="true"
        list-type="picture"
        :beforeUpload="beforeUpload"
      >
        <p class="ant-upload-drag-icon">
          <inbox-outlined />
        </p>
        <p class="ant-upload-text">
          Click or drag file to this area to {{page}}
        </p>
        <p class="ant-upload-hint">
          Support for a single or bulk upload.
        </p>
      </a-upload-dragger>
      <a-button
        block
        class="save"
        type="primary"
        @click="save"
        :loading="uploading"
        :disabled="fileCount === 0"
      >
        保存
      </a-button>
    </div>
  </div>
</template>

<script>
import { InboxOutlined } from '@ant-design/icons-vue'
import { saveAs } from 'file-saver'
import dw from 'web-digital-watermarking'
import JSZip from 'jszip'
import dayjs from 'dayjs'

export default {
  name: 'Index',
  data: function () {
    return {
      watermarkText: 'Magic Watermark',
      zip: null,
      uploading: false,
      selectedKeys: ['embed']
    }
  },
  component: {
    InboxOutlined
  },
  computed: {
    page: function () {
      return this.selectedKeys[0]
    },
    fileCount: function () {
      return Object.keys(this.zip.files).length
    }
  },
  methods: {
    clickMenu () {
      this.zip = new JSZip()
    },
    beforeUpload (file) {
      console.log('xxx', file)
      const reader = new FileReader()
      reader.readAsDataURL(file)
      this.uploading = true
      reader.onload = async (e) => {
        const dataUrl = e.target.result
        if (this.page === 'embed') {
          const enCodeFileRes = await dw.transformImageUrlWithText(dataUrl, this.watermarkText, 1.1)
          this.zip.file(file.name, this.dataURLtoFile(enCodeFileRes))
        } else {
          const deCodeImageUrl = await dw.getTextFormImageUrl(dataUrl)
          this.zip.file(file.name, this.dataURLtoFile(deCodeImageUrl))
        }
        this.uploading = false
      }
      return false
    },
    /**
     * DataUrl转为File
     * @param {String} dataUrl - dataUrl地址
     * @param {String} fileName - file文件名
     */
    dataURLtoFile (dataUrl, fileName) {
      const arr = dataUrl.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      return new File([u8arr], fileName, { type: mime })
    },
    save () {
      this.zip.generateAsync({ type: 'blob' }).then((content) => {
        // see FileSaver.js
        const time = dayjs().format('MM-DD HH:mm:ss')
        saveAs(content, `magic-watermark-${this.page}-${time}.zip`)
      })
    }
  },
  created () {
    this.zip = new JSZip()
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
  .container {
    width: 100%;
    display: flex;
    flex-direction: column;
    .title {
      display: inline;
      color: white;
      margin-left: 30px;
      margin-right: 30px;
    }
  }
  .input {
    margin-bottom: 30px;
  }
  .main {
    width: 1200px;
    margin: 0 auto;
    padding-top: 30px;
  }

  .upload {
    margin-top: 60px;
    margin-bottom: 30px;
    .ant-upload {
      height: 249px!important;
    }
  }
  .save {
    margin-top: 50px;
  }
</style>

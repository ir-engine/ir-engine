#!/bin/bash

set -e

COMPRESSION="uastc"
OUTPUT_DIR=""
KTX2_SOURCE_DIR=""

SUPPORTED_EXTENSIONS="png exr raw jpg jpeg"

show_usage() {
    cat << EOF
Usage: $0 <command> [arguments]

Commands:
  compress     Compress texture files to KTX2 format
  update       Update glTF files to reference KTX2 textures
  process      Process single glTF model (compress + update)
  batch        Batch process multiple glTF models

Examples:
  $0 compress ./textures --output ./compressed
  $0 update model.gltf --output ./final
  $0 process model.gltf --output ./compressed
  $0 batch ./models --output ./compressed_models

Dependencies:
  - ktx (KTX-Software tools for texture compression)
  - jq (JSON processor for glTF file updates)
EOF
}

check_dependencies() {
    local need_ktx="$1"
    local need_jq="$2"
    
    if [ "$need_ktx" = true ] && ! command -v ktx >/dev/null 2>&1; then
        echo "Error: 'ktx' command not found. Please install KTX-Software tools." >&2
        exit 1
    fi
    
    if [ "$need_jq" = true ] && ! command -v jq >/dev/null 2>&1; then
        echo "Error: 'jq' command not found. Please install jq for JSON processing." >&2
        exit 1
    fi
}

find_texture_files() {
    local folder="$1"
    local recursive="$2"
    
    if [ ! -d "$folder" ]; then
        echo "Error: Folder '$folder' does not exist." >&2
        return 1
    fi
    
    local find_args=("$folder")
    if [ "$recursive" = false ]; then
        find_args+=("-maxdepth" "1")
    fi
    
    find_args+=("-type" "f")
    
    # Build the name pattern
    find_args+=("(" "-name" "*.png")
    for ext in exr raw jpg jpeg; do
        find_args+=("-o" "-name" "*.${ext}")
    done
    find_args+=(")")
    
    find "${find_args[@]}"
}

compress_texture() {
    local input_file="$1"
    local output_dir="$2"
    local compression_format="$3"

    if [ -z "$output_dir" ]; then
        output_dir=$(dirname "$input_file")
    fi

    mkdir -p "$output_dir"

    local input_basename=$(basename "$input_file")
    local filename_no_ext="${input_basename%.*}"
    local output_filename="${filename_no_ext}.ktx2"
    local output_path="$output_dir/$output_filename"

    echo "Compressing: $input_basename -> $output_filename"

    local format_arg
    if [[ "$input_file" == *.exr ]]; then
        format_arg="R16G16B16A16_SFLOAT"
    else
        format_arg="R8G8B8A8_UNORM"
    fi

    local -a cmd=(
        "ktx" "create"
        "--format" "$format_arg"
        "--encode" "$compression_format"
    )

    if [ "$compression_format" = "uastc" ]; then
        cmd+=("--uastc-quality" "4")
    fi

    if [[ "$input_file" == *.png ]]; then
        cmd+=("--assign-tf" "linear")
    fi

    cmd+=("$input_file" "$output_path")

    if "${cmd[@]}" >/dev/null 2>&1; then
        echo "✓ Successfully compressed: $output_filename"
    else
        cmd+=("--assign-tf" "linear")
        if "${cmd[@]}" >/dev/null 2>&1; then
            echo "✓ Successfully compressed: $output_filename (with ICC workaround)"
        else
            echo "✗ Error compressing $input_basename"
            return 1
        fi
    fi
}

find_ktx2_files() {
    local directory="$1"
    
    if [ ! -d "$directory" ]; then
        echo "Error: Directory '$directory' does not exist." >&2
        return 1
    fi

    find "$directory" -maxdepth 1 -name "*.ktx2" -type f | while read -r ktx2_file; do
        local base_name=$(basename "$ktx2_file" .ktx2)
        local ktx2_name=$(basename "$ktx2_file")
        echo "$base_name:$ktx2_name"
    done
}

update_gltf_texture_references() {
    local gltf_file="$1"
    local output_dir="$2"
    local ktx2_source_dir="$3"
    
    if [ ! -f "$gltf_file" ]; then
        echo "Error: glTF file '$gltf_file' does not exist." >&2
        return 1
    fi
    
    if [[ ! "$gltf_file" == *.gltf ]]; then
        echo "Error: File '$gltf_file' is not a glTF file (.gltf)." >&2
        return 1
    fi

    local original_directory=$(dirname "$gltf_file")
    local ktx2_directory="${ktx2_source_dir:-$original_directory}"

    local output_gltf_path
    if [ -n "$output_dir" ]; then
        mkdir -p "$output_dir"
        output_gltf_path="$output_dir/$(basename "$gltf_file")"
    else
        output_gltf_path="$gltf_file"
    fi

    local ktx2_mapping=$(find_ktx2_files "$ktx2_directory")

    if [ -z "$ktx2_mapping" ]; then
        echo "No KTX2 files found in directory: $ktx2_directory"
        return 1
    fi

    if ! jq -e '.images' "$gltf_file" >/dev/null 2>&1; then
        echo "No 'images' array found in glTF file."
        return 1
    fi

    local image_count=$(jq '.images | length' "$gltf_file")
    local updated_count=0
    local has_ktx2_updates=false

    local temp_gltf=$(mktemp)
    cp "$gltf_file" "$temp_gltf"

    for ((i=0; i<image_count; i++)); do
        local original_uri=$(jq -r ".images[$i].uri // null" "$temp_gltf")
        
        if [ "$original_uri" = "null" ]; then
            continue
        fi
        
        local base_name=$(basename "$original_uri")
        base_name="${base_name%.*}"

        local ktx2_filename=""
        while IFS=':' read -r ktx2_base ktx2_name; do
            if [ "$ktx2_base" = "$base_name" ]; then
                ktx2_filename="$ktx2_name"
                break
            fi
        done <<< "$ktx2_mapping"

        if [ -n "$ktx2_filename" ]; then
            if [ -n "$output_dir" ] && [ "$ktx2_directory" != "$output_dir" ]; then
                local source_ktx2="$ktx2_directory/$ktx2_filename"
                local dest_ktx2="$output_dir/$ktx2_filename"
                if [ -f "$source_ktx2" ]; then
                    cp "$source_ktx2" "$dest_ktx2"
                fi
            fi

            temp_gltf_new=$(mktemp)
            jq ".images[$i].uri = \"$ktx2_filename\" | .images[$i].mimeType = \"image/ktx2\" | del(.images[$i].extensions)" "$temp_gltf" > "$temp_gltf_new"
            mv "$temp_gltf_new" "$temp_gltf"

            updated_count=$((updated_count + 1))
            has_ktx2_updates=true
        fi
    done

    if [ "$has_ktx2_updates" = true ] && jq -e '.textures' "$temp_gltf" >/dev/null 2>&1; then
        local texture_count=$(jq '.textures | length' "$temp_gltf")
        
        for ((i=0; i<texture_count; i++)); do
            local source_image_index=$(jq -r ".textures[$i].source // null" "$temp_gltf")
            
            if [ "$source_image_index" != "null" ]; then
                local image_mime_type=$(jq -r ".images[$source_image_index].mimeType // null" "$temp_gltf")
                
                if [ "$image_mime_type" = "image/ktx2" ]; then
                    temp_gltf_new=$(mktemp)
                    jq ".textures[$i].extensions.KHR_texture_basisu = {\"source\": $source_image_index}" "$temp_gltf" > "$temp_gltf_new"
                    mv "$temp_gltf_new" "$temp_gltf"
                fi
            fi
        done
    fi

    if [ "$has_ktx2_updates" = true ]; then
        temp_gltf_new=$(mktemp)
        jq '
            .extensionsUsed = (.extensionsUsed // []) |
            if .extensionsUsed | contains(["KHR_texture_basisu"]) | not then
                .extensionsUsed += ["KHR_texture_basisu"]
            else
                .
            end |
            .extensionsRequired = (.extensionsRequired // []) |
            if .extensionsRequired | contains(["KHR_texture_basisu"]) | not then
                .extensionsRequired += ["KHR_texture_basisu"]
            else
                .
            end
        ' "$temp_gltf" > "$temp_gltf_new"
        mv "$temp_gltf_new" "$temp_gltf"
    fi

    if [ "$updated_count" -gt 0 ]; then
        cp "$temp_gltf" "$output_gltf_path"
        echo "Updated $updated_count texture references in glTF file"

        if [ -n "$output_dir" ] && [ "$(dirname "$gltf_file")" != "$output_dir" ]; then
            local bin_file="${gltf_file%.*}.bin"
            if [ -f "$bin_file" ]; then
                local dest_bin="$output_dir/$(basename "$bin_file")"
                cp "$bin_file" "$dest_bin"
            fi
        fi

        rm -f "$temp_gltf"
        return 0
    else
        echo "No texture references were updated."
        rm -f "$temp_gltf"
        return 1
    fi
}

find_gltf_models() {
    local models_dir="$1"
    local filter="$2"
    
    if [ ! -d "$models_dir" ]; then
        echo "Error: Models directory '$models_dir' does not exist." >&2
        return 1
    fi
    
    find "$models_dir" -mindepth 1 -maxdepth 1 -type d | while read -r subdir; do
        local model_name=$(basename "$subdir")

        if [ -z "$model_name" ] || [[ "$model_name" == .* ]]; then
            continue
        fi

        if [ -n "$filter" ] && [[ ! "$model_name" == *"$filter"* ]]; then
            continue
        fi

        for gltf_file in "$subdir"/*.gltf; do
            if [ -f "$gltf_file" ]; then
                echo "$subdir|$gltf_file|$model_name"
            fi
        done
    done
}

cmd_compress() {
    shift

    local folder=""
    local recursive=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --compression|-c)
                COMPRESSION="$2"
                if [[ "$COMPRESSION" != "uastc" && "$COMPRESSION" != "basis-lz" ]]; then
                    echo "Error: Compression must be 'uastc' or 'basis-lz'" >&2
                    exit 1
                fi
                shift 2
                ;;
            --output|-o)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            --recursive|-r)
                recursive=true
                shift
                ;;
            -*)
                echo "Unknown option: $1" >&2
                exit 1
                ;;
            *)
                if [ -z "$folder" ]; then
                    folder="$1"
                else
                    echo "Error: Too many positional arguments" >&2
                    exit 1
                fi
                shift
                ;;
        esac
    done

    if [ -z "$folder" ]; then
        echo "Error: Folder path is required" >&2
        exit 1
    fi

    check_dependencies true false

    texture_files=$(find_texture_files "$folder" "$recursive")

    if [ -z "$texture_files" ]; then
        echo "No supported texture files found."
        exit 1
    fi

    echo "$texture_files" | while read -r texture_file; do
        compress_texture "$texture_file" "$OUTPUT_DIR" "$COMPRESSION"
    done

    echo "Compression complete!"
}

cmd_update() {
    shift

    local gltf_file=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            --output)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            --ktx2-dir)
                KTX2_SOURCE_DIR="$2"
                shift 2
                ;;
            -*)
                echo "Unknown option: $1" >&2
                exit 1
                ;;
            *)
                if [ -z "$gltf_file" ]; then
                    gltf_file="$1"
                else
                    echo "Error: Too many positional arguments" >&2
                    exit 1
                fi
                shift
                ;;
        esac
    done

    if [ -z "$gltf_file" ]; then
        echo "Error: glTF file is required" >&2
        exit 1
    fi

    check_dependencies false true

    update_gltf_texture_references "$gltf_file" "$OUTPUT_DIR" "$KTX2_SOURCE_DIR"
}

cmd_process() {
    shift

    local gltf_file=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            --output|-o)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            --compression|-c)
                COMPRESSION="$2"
                if [[ "$COMPRESSION" != "uastc" && "$COMPRESSION" != "basis-lz" ]]; then
                    echo "Error: Compression must be 'uastc' or 'basis-lz'" >&2
                    exit 1
                fi
                shift 2
                ;;
            -*)
                echo "Unknown option: $1" >&2
                exit 1
                ;;
            *)
                if [ -z "$gltf_file" ]; then
                    gltf_file="$1"
                else
                    echo "Error: Too many positional arguments" >&2
                    exit 1
                fi
                shift
                ;;
        esac
    done

    if [ -z "$gltf_file" ]; then
        echo "Error: glTF file is required" >&2
        exit 1
    fi

    if [ -z "$OUTPUT_DIR" ]; then
        echo "Error: --output option is required" >&2
        exit 1
    fi

    if [ ! -f "$gltf_file" ]; then
        echo "Error: glTF file '$gltf_file' does not exist." >&2
        exit 1
    fi

    if [[ ! "$gltf_file" == *.gltf ]]; then
        echo "Error: File '$gltf_file' is not a glTF file (.gltf)." >&2
        exit 1
    fi

    check_dependencies true true

    gltf_file=$(realpath "$gltf_file")
    local gltf_dir=$(dirname "$gltf_file")

    mkdir -p "$OUTPUT_DIR"

    if command -v realpath >/dev/null 2>&1; then
        OUTPUT_DIR=$(realpath "$OUTPUT_DIR")
    else
        OUTPUT_DIR=$(cd "$OUTPUT_DIR" && pwd)
    fi

    echo "Processing glTF model: $(basename "$gltf_file")"

    texture_files=$(find_texture_files "$gltf_dir" false)
    if [ -n "$texture_files" ]; then
        echo "Compressing textures..."
        echo "$texture_files" | while read -r texture_file; do
            compress_texture "$texture_file" "$OUTPUT_DIR" "$COMPRESSION"
        done
    fi

    echo "Updating glTF references..."
    local ktx2_source_dir="$OUTPUT_DIR"
    update_gltf_texture_references "$gltf_file" "$OUTPUT_DIR" "$ktx2_source_dir"

    echo "Processing complete! Output in: $OUTPUT_DIR"
}

cmd_batch() {
    shift

    local models_dir=""
    local filter=""

    while [[ $# -gt 0 ]]; do
        case $1 in
            --output|-o)
                OUTPUT_DIR="$2"
                shift 2
                ;;
            --compression|-c)
                COMPRESSION="$2"
                if [[ "$COMPRESSION" != "uastc" && "$COMPRESSION" != "basis-lz" ]]; then
                    echo "Error: Compression must be 'uastc' or 'basis-lz'" >&2
                    exit 1
                fi
                shift 2
                ;;
            --filter)
                filter="$2"
                shift 2
                ;;
            -*)
                echo "Unknown option: $1" >&2
                exit 1
                ;;
            *)
                if [ -z "$models_dir" ]; then
                    models_dir="$1"
                else
                    echo "Error: Too many positional arguments" >&2
                    exit 1
                fi
                shift
                ;;
        esac
    done

    if [ -z "$models_dir" ]; then
        echo "Error: Models directory is required" >&2
        exit 1
    fi

    if [ -z "$OUTPUT_DIR" ]; then
        echo "Error: --output option is required" >&2
        exit 1
    fi

    check_dependencies true true

    models_info=$(find_gltf_models "$models_dir" "$filter")

    if [ -z "$models_info" ]; then
        echo "No glTF models found in $models_dir"
        if [ -n "$filter" ]; then
            echo "Filter: '$filter'"
        fi
        exit 1
    fi

    model_count=$(echo "$models_info" | wc -l)

    mkdir -p "$OUTPUT_DIR"

    echo "Processing $model_count models..."

    successful=0
    failed=0

    while IFS='|' read -r model_path gltf_file model_name; do
        echo "Processing: $model_name"

        local model_output_dir="$OUTPUT_DIR/$model_name"

        if "$0" process "$gltf_file" --output "$model_output_dir" --compression "$COMPRESSION"; then
            successful=$((successful + 1))
        else
            failed=$((failed + 1))
        fi
    done <<< "$models_info"

    echo "Batch processing complete: $successful successful, $failed failed"

    if [ "$failed" -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

case "$1" in
    compress)
        cmd_compress "$@"
        ;;
    update)
        cmd_update "$@"
        ;;
    process)
        cmd_process "$@"
        ;;
    batch)
        cmd_batch "$@"
        ;;
    *)
        echo "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac 
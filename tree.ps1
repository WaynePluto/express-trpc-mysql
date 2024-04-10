function Get-DirectoryTree {
    param (
        [Parameter(Mandatory = $true, Position = 0)]
        [string]$Path,

        [Parameter(Position = 1)]
        [string]$Exclude = "node_modules"
    )

    $indentation = 0

    function Recurse($currentPath) {
        $indent = " " * $indentation
        $items = Get-ChildItem -LiteralPath $currentPath | Where-Object { $_.Name -ne $Exclude }

        foreach ($item in $items) {
            Write-Host "$indent |- $item"

            if ($item.PSIsContainer) {
                $indentation += 4
                Recurse -currentPath $item.FullName
                $indentation -= 4
            }
        }
    }

    Recurse -currentPath $Path
}

Get-DirectoryTree -Path "." -Exclude "node_modules"